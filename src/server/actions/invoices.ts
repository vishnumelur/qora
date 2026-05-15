'use server';

import { revalidatePath } from 'next/cache';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import type { ZodError } from 'zod';
import { db } from '@/server/db/client';
import {
  invoices,
  invoiceItems,
  payments,
  customers,
  type Invoice,
  type InvoiceItem,
  type Payment,
} from '@/server/db/schema';
import { invoiceCreateSchema, invoiceUpdateSchema } from '@/server/validation/invoice';
import { allocateNumber } from '@/server/domain/numbering';
import { recordTotals, sumPayments } from '@/server/domain/totals';

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export type InvoiceWithItems = Invoice & {
  customer: { id: string; name: string; attention: string | null; addressLine: string | null };
  items: InvoiceItem[];
  payments: Payment[];
};

export type PaymentMethod = 'bank_transfer' | 'upi' | 'cash' | 'cheque' | 'card' | 'other';
const PAYMENT_METHODS: readonly PaymentMethod[] = [
  'bank_transfer',
  'upi',
  'cash',
  'cheque',
  'card',
  'other',
] as const;

function isPaymentMethod(s: string): s is PaymentMethod {
  return (PAYMENT_METHODS as readonly string[]).includes(s);
}

export async function createInvoiceAction(
  input: unknown,
): Promise<ActionResult<{ id: string; number: string }>> {
  const parsed = invoiceCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid input', fieldErrors: zodErrors(parsed.error) };
  }

  const data = parsed.data;
  const year = Number(data.issueDate.slice(0, 4));

  const result = await db.transaction(async (tx) => {
    const number = await allocateNumber(tx, 'invoice', year);
    const [row] = await tx
      .insert(invoices)
      .values({
        number,
        customerId: data.customerId,
        title: data.title,
        issueDate: data.issueDate,
        dueDate: data.dueDate ?? null,
        gstPercent: data.gstPercent,
        terms: data.terms,
        notes: nullableStr(data.notes),
        status: 'draft',
      })
      .returning({ id: invoices.id, number: invoices.number });

    await tx.insert(invoiceItems).values(
      data.items.map((it, idx) => ({
        invoiceId: row.id,
        position: idx,
        description: it.description,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
      })),
    );

    return row;
  });

  revalidatePath('/admin', 'layout');
  return { ok: true, data: result };
}

export async function updateInvoiceAction(id: string, input: unknown): Promise<ActionResult> {
  const parsed = invoiceUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid input', fieldErrors: zodErrors(parsed.error) };
  }

  const data = parsed.data;

  await db.transaction(async (tx) => {
    await tx
      .update(invoices)
      .set({
        customerId: data.customerId,
        title: data.title,
        issueDate: data.issueDate,
        dueDate: data.dueDate ?? null,
        gstPercent: data.gstPercent,
        terms: data.terms,
        notes: nullableStr(data.notes),
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, id));

    await tx.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));
    await tx.insert(invoiceItems).values(
      data.items.map((it, idx) => ({
        invoiceId: id,
        position: idx,
        description: it.description,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
      })),
    );
  });

  revalidatePath('/admin', 'layout');
  return { ok: true, data: undefined };
}

export async function markInvoicePaidAction(id: string, paidOn?: string): Promise<void> {
  const date = paidOn ?? new Date().toISOString().slice(0, 10);
  await db
    .update(invoices)
    .set({ status: 'paid', paidOn: date, updatedAt: new Date() })
    .where(eq(invoices.id, id));
  revalidatePath('/admin', 'layout');
}

export async function setInvoiceStatusAction(
  id: string,
  status: 'draft' | 'sent' | 'paid',
): Promise<void> {
  const update: { status: string; updatedAt: Date; paidOn?: string | null } = {
    status,
    updatedAt: new Date(),
  };
  if (status === 'paid') {
    update.paidOn = new Date().toISOString().slice(0, 10);
  } else {
    update.paidOn = null;
  }
  await db.update(invoices).set(update).where(eq(invoices.id, id));
  revalidatePath('/admin', 'layout');
}

export async function deleteInvoiceAction(id: string): Promise<ActionResult> {
  try {
    await db.delete(invoices).where(eq(invoices.id, id));
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { ok: false, error: `Couldn't delete: ${msg}` };
  }
  revalidatePath('/admin', 'layout');
  return { ok: true, data: undefined };
}

export async function duplicateInvoiceAction(
  id: string,
): Promise<{ id: string; number: string } | null> {
  const original = await getInvoice(id);
  if (!original) return null;
  const today = new Date().toISOString().slice(0, 10);
  const dueDate = addDays(today, 14);

  const result = await db.transaction(async (tx) => {
    const year = Number(today.slice(0, 4));
    const number = await allocateNumber(tx, 'invoice', year);
    const [row] = await tx
      .insert(invoices)
      .values({
        number,
        customerId: original.customerId,
        title: original.title,
        issueDate: today,
        dueDate,
        gstPercent: original.gstPercent,
        terms: original.terms,
        notes: original.notes,
        status: 'draft',
      })
      .returning({ id: invoices.id, number: invoices.number });

    if (original.items.length) {
      await tx.insert(invoiceItems).values(
        original.items.map((it, idx) => ({
          invoiceId: row.id,
          position: idx,
          description: it.description,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
        })),
      );
    }
    return row;
  });

  revalidatePath('/admin', 'layout');
  return result;
}

export async function getInvoice(id: string): Promise<InvoiceWithItems | null> {
  const [row] = await db
    .select({
      i: invoices,
      c_id: customers.id,
      c_name: customers.name,
      c_attention: customers.attention,
      c_addressLine: customers.addressLine,
    })
    .from(invoices)
    .innerJoin(customers, eq(customers.id, invoices.customerId))
    .where(eq(invoices.id, id))
    .limit(1);
  if (!row) return null;
  const [items, pays] = await Promise.all([
    db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, id))
      .orderBy(invoiceItems.position),
    db
      .select()
      .from(payments)
      .where(eq(payments.invoiceId, id))
      .orderBy(desc(payments.paidOn), desc(payments.createdAt)),
  ]);
  return {
    ...row.i,
    customer: {
      id: row.c_id,
      name: row.c_name,
      attention: row.c_attention,
      addressLine: row.c_addressLine,
    },
    items,
    payments: pays,
  };
}

// ============ PAYMENTS ============

type PaymentInput = {
  amount: string;
  paidOn: string;
  method: string;
  reference?: string | null;
  notes?: string | null;
};

function parsePaymentInput(raw: unknown): { ok: true; data: PaymentInput } | { ok: false; error: string } {
  if (!raw || typeof raw !== 'object') return { ok: false, error: 'Invalid input' };
  const r = raw as Record<string, unknown>;
  const amount = String(r.amount ?? '').trim();
  const paidOn = String(r.paidOn ?? '').trim();
  const method = String(r.method ?? 'bank_transfer').trim();
  if (!/^\d+(\.\d{1,2})?$/.test(amount) || Number(amount) <= 0) {
    return { ok: false, error: 'Amount must be a positive number' };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(paidOn)) {
    return { ok: false, error: 'Invalid date — expected YYYY-MM-DD' };
  }
  if (!isPaymentMethod(method)) {
    return { ok: false, error: 'Invalid payment method' };
  }
  return {
    ok: true,
    data: {
      amount,
      paidOn,
      method,
      reference: typeof r.reference === 'string' && r.reference.trim() ? r.reference.trim() : null,
      notes: typeof r.notes === 'string' && r.notes.trim() ? r.notes.trim() : null,
    },
  };
}

/**
 * Record a single payment against an invoice. If the resulting sum of
 * payments meets or exceeds the invoice total, the invoice auto-flips
 * to status='paid' and paid_on is set to this payment's date.
 */
export async function recordPaymentAction(
  invoiceId: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parsePaymentInput(input);
  if (!parsed.ok) return { ok: false, error: parsed.error };
  const p = parsed.data;

  const result = await db.transaction(async (tx) => {
    // Make sure the invoice exists + load what we need to compute totals
    const [inv] = await tx.select().from(invoices).where(eq(invoices.id, invoiceId)).limit(1);
    if (!inv) return { ok: false as const, error: 'Invoice not found' };

    const [items, existingPayments] = await Promise.all([
      tx.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId)),
      tx.select().from(payments).where(eq(payments.invoiceId, invoiceId)),
    ]);

    const [row] = await tx
      .insert(payments)
      .values({
        invoiceId,
        amount: p.amount,
        paidOn: p.paidOn,
        method: p.method,
        reference: p.reference,
        notes: p.notes,
      })
      .returning({ id: payments.id });

    // Recompute paid sum + auto-flip status
    const newSum = sumPayments([...existingPayments, { amount: p.amount }]);
    const total = recordTotals(items, inv.gstPercent).total;
    if (newSum >= total && total > 0) {
      await tx
        .update(invoices)
        .set({ status: 'paid', paidOn: p.paidOn, updatedAt: new Date() })
        .where(eq(invoices.id, invoiceId));
    }

    return { ok: true as const, data: { id: row.id } };
  });

  if (result.ok) revalidatePath('/admin', 'layout');
  return result;
}

export async function deletePaymentAction(
  invoiceId: string,
  paymentId: string,
): Promise<ActionResult> {
  await db.transaction(async (tx) => {
    await tx.delete(payments).where(eq(payments.id, paymentId));

    // After deletion, recompute. If invoice was 'paid' and is no longer
    // fully covered, revert status to 'sent'.
    const [inv] = await tx.select().from(invoices).where(eq(invoices.id, invoiceId)).limit(1);
    if (!inv) return;
    const [items, remainingPayments] = await Promise.all([
      tx.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId)),
      tx.select().from(payments).where(eq(payments.invoiceId, invoiceId)),
    ]);
    const newSum = sumPayments(remainingPayments);
    const total = recordTotals(items, inv.gstPercent).total;
    if (inv.status === 'paid' && newSum < total) {
      await tx
        .update(invoices)
        .set({ status: 'sent', paidOn: null, updatedAt: new Date() })
        .where(eq(invoices.id, invoiceId));
    }
  });
  revalidatePath('/admin', 'layout');
  return { ok: true, data: undefined };
}

export async function listInvoices(opts?: {
  status?: string;
  customerId?: string;
  year?: number;
  q?: string;
  from?: string;
  to?: string;
  sort?: 'number' | 'issueDate' | 'createdAt' | 'title' | 'dueDate';
  dir?: 'asc' | 'desc';
}): Promise<(Invoice & { customerName: string; customerAttention: string | null })[]> {
  const conds: SQL[] = [];
  if (opts?.status) conds.push(eq(invoices.status, opts.status));
  if (opts?.customerId) conds.push(eq(invoices.customerId, opts.customerId));
  if (opts?.year) conds.push(sql`extract(year from ${invoices.issueDate}) = ${opts.year}`);
  if (opts?.from && isISODate(opts.from)) conds.push(gte(invoices.issueDate, opts.from));
  if (opts?.to && isISODate(opts.to)) conds.push(lte(invoices.issueDate, opts.to));
  if (opts?.q) {
    const pat = `%${opts.q}%`;
    conds.push(sql`(${invoices.title} ILIKE ${pat} OR ${invoices.number} ILIKE ${pat} OR ${customers.name} ILIKE ${pat})`);
  }

  const sortCol =
    opts?.sort === 'number'
      ? invoices.number
      : opts?.sort === 'issueDate'
        ? invoices.issueDate
        : opts?.sort === 'dueDate'
          ? invoices.dueDate
          : opts?.sort === 'title'
            ? invoices.title
            : invoices.createdAt;
  const ordered = opts?.dir === 'asc' ? sortCol : desc(sortCol);

  return await db
    .select({
      id: invoices.id,
      number: invoices.number,
      customerId: invoices.customerId,
      title: invoices.title,
      issueDate: invoices.issueDate,
      dueDate: invoices.dueDate,
      gstPercent: invoices.gstPercent,
      terms: invoices.terms,
      notes: invoices.notes,
      status: invoices.status,
      paidOn: invoices.paidOn,
      sourceQuoteId: invoices.sourceQuoteId,
      createdAt: invoices.createdAt,
      updatedAt: invoices.updatedAt,
      customerName: customers.name,
      customerAttention: customers.attention,
    })
    .from(invoices)
    .innerJoin(customers, eq(customers.id, invoices.customerId))
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(ordered);
}

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

function nullableStr(v: string | null | undefined): string | null {
  return typeof v === 'string' && v.trim() ? v : null;
}

function isISODate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function zodErrors(err: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join('.');
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
