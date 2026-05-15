'use server';

import { revalidatePath } from 'next/cache';
import { eq, ilike, or, desc, sql } from 'drizzle-orm';
import type { ZodError } from 'zod';
import { db } from '@/server/db/client';
import { customers, quotes, invoices, type Customer } from '@/server/db/schema';
import { customerSchema, type CustomerInput } from '@/server/validation/customer';

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function normalize(input: CustomerInput) {
  return {
    name: input.name.trim(),
    attention: empty(input.attention),
    addressLine: empty(input.addressLine),
    gstNumber: empty(input.gstNumber),
    email: empty(input.email),
    phone: empty(input.phone),
    notes: empty(input.notes),
  };
}

function empty(v: string | null | undefined): string | null {
  return v && v.trim() ? v.trim() : null;
}

export async function createCustomerAction(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = customerSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid input', fieldErrors: zodErrors(parsed.error) };
  }
  const [row] = await db
    .insert(customers)
    .values(normalize(parsed.data))
    .returning({ id: customers.id });
  revalidatePath('/admin', 'layout');
  return { ok: true, data: { id: row.id } };
}

export async function updateCustomerAction(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = customerSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid input', fieldErrors: zodErrors(parsed.error) };
  }
  await db
    .update(customers)
    .set({ ...normalize(parsed.data), updatedAt: new Date() })
    .where(eq(customers.id, id));
  revalidatePath('/admin', 'layout');
  return { ok: true, data: undefined };
}

export async function deleteCustomerAction(id: string): Promise<ActionResult> {
  // Pre-flight: a customer cannot be deleted while quotes/invoices still
  // reference them (customer_id is NOT NULL on both tables). Surface a
  // friendly message instead of letting Postgres throw a FK violation.
  const [{ qc, ic }] = await db
    .select({
      qc: sql<number>`(select count(*) from ${quotes} where ${quotes.customerId} = ${id})`,
      ic: sql<number>`(select count(*) from ${invoices} where ${invoices.customerId} = ${id})`,
    })
    .from(customers)
    .where(eq(customers.id, id))
    .limit(1);

  const qn = Number(qc);
  const inn = Number(ic);
  if (qn > 0 || inn > 0) {
    const parts: string[] = [];
    if (qn > 0) parts.push(`${qn} quote${qn === 1 ? '' : 's'}`);
    if (inn > 0) parts.push(`${inn} invoice${inn === 1 ? '' : 's'}`);
    return {
      ok: false,
      error: `Cannot delete — this customer has ${parts.join(' and ')}. Delete or reassign those first.`,
    };
  }

  try {
    await db.delete(customers).where(eq(customers.id, id));
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { ok: false, error: `Couldn't delete: ${msg}` };
  }
  revalidatePath('/admin', 'layout');
  return { ok: true, data: undefined };
}

export async function listCustomers(opts?: { q?: string }): Promise<Customer[]> {
  if (opts?.q) {
    const pat = `%${opts.q}%`;
    return await db
      .select()
      .from(customers)
      .where(or(ilike(customers.name, pat), ilike(customers.attention, pat)))
      .orderBy(desc(customers.createdAt));
  }
  return await db.select().from(customers).orderBy(desc(customers.createdAt));
}

export async function getCustomer(id: string): Promise<Customer | undefined> {
  const [row] = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  return row;
}

function zodErrors(err: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join('.');
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
