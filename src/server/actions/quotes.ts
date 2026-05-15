'use server';

import { revalidatePath } from 'next/cache';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import type { ZodError } from 'zod';
import { db } from '@/server/db/client';
import {
  quotes,
  quoteItems,
  invoices,
  invoiceItems,
  customers,
  type Quote,
  type QuoteItem,
} from '@/server/db/schema';
import { quoteCreateSchema, quoteUpdateSchema } from '@/server/validation/quote';
import { allocateNumber } from '@/server/domain/numbering';

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export type QuoteWithItems = Quote & {
  customer: { id: string; name: string; attention: string | null; addressLine: string | null };
  items: QuoteItem[];
};

export async function createQuoteAction(
  input: unknown,
): Promise<ActionResult<{ id: string; number: string }>> {
  const parsed = quoteCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid input', fieldErrors: zodErrors(parsed.error) };
  }

  const data = parsed.data;
  const year = Number(data.issueDate.slice(0, 4));

  const result = await db.transaction(async (tx) => {
    const number = await allocateNumber(tx, 'quote', year);
    const [row] = await tx
      .insert(quotes)
      .values({
        number,
        customerId: data.customerId,
        title: data.title,
        issueDate: data.issueDate,
        validUntil: data.validUntil,
        gstPercent: data.gstPercent,
        terms: data.terms,
        notes: nullableStr(data.notes),
        status: 'draft',
      })
      .returning({ id: quotes.id, number: quotes.number });

    await tx.insert(quoteItems).values(
      data.items.map((it, idx) => ({
        quoteId: row.id,
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

export async function updateQuoteAction(id: string, input: unknown): Promise<ActionResult> {
  const parsed = quoteUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid input', fieldErrors: zodErrors(parsed.error) };
  }

  const data = parsed.data;

  await db.transaction(async (tx) => {
    await tx
      .update(quotes)
      .set({
        customerId: data.customerId,
        title: data.title,
        issueDate: data.issueDate,
        validUntil: data.validUntil,
        gstPercent: data.gstPercent,
        terms: data.terms,
        notes: nullableStr(data.notes),
        updatedAt: new Date(),
      })
      .where(eq(quotes.id, id));

    await tx.delete(quoteItems).where(eq(quoteItems.quoteId, id));
    await tx.insert(quoteItems).values(
      data.items.map((it, idx) => ({
        quoteId: id,
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

export async function setQuoteStatusAction(
  id: string,
  status: 'draft' | 'sent' | 'accepted' | 'rejected',
): Promise<void> {
  await db.update(quotes).set({ status, updatedAt: new Date() }).where(eq(quotes.id, id));
  revalidatePath('/admin', 'layout');
}

export async function deleteQuoteAction(id: string): Promise<ActionResult> {
  try {
    await db.delete(quotes).where(eq(quotes.id, id));
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { ok: false, error: `Couldn't delete: ${msg}` };
  }
  revalidatePath('/admin', 'layout');
  return { ok: true, data: undefined };
}

export async function duplicateQuoteAction(
  id: string,
): Promise<{ id: string; number: string } | null> {
  const original = await getQuote(id);
  if (!original) return null;
  const today = new Date().toISOString().slice(0, 10);
  const validUntil = addDays(today, 7);

  const result = await db.transaction(async (tx) => {
    const year = Number(today.slice(0, 4));
    const number = await allocateNumber(tx, 'quote', year);
    const [row] = await tx
      .insert(quotes)
      .values({
        number,
        customerId: original.customerId,
        title: original.title,
        issueDate: today,
        validUntil,
        gstPercent: original.gstPercent,
        terms: original.terms,
        notes: original.notes,
        status: 'draft',
      })
      .returning({ id: quotes.id, number: quotes.number });

    if (original.items.length) {
      await tx.insert(quoteItems).values(
        original.items.map((it, idx) => ({
          quoteId: row.id,
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

export async function convertQuoteToInvoiceAction(
  quoteId: string,
): Promise<{ invoiceId: string; invoiceNumber: string } | null> {
  const q = await getQuote(quoteId);
  if (!q) return null;
  const today = new Date().toISOString().slice(0, 10);
  const dueDate = addDays(today, 14);

  const result = await db.transaction(async (tx) => {
    const year = Number(today.slice(0, 4));
    const number = await allocateNumber(tx, 'invoice', year);
    const [invRow] = await tx
      .insert(invoices)
      .values({
        number,
        customerId: q.customerId,
        title: q.title,
        issueDate: today,
        dueDate,
        gstPercent: q.gstPercent,
        terms: q.terms,
        notes: q.notes,
        status: 'draft',
        sourceQuoteId: q.id,
      })
      .returning({ id: invoices.id, number: invoices.number });

    if (q.items.length) {
      await tx.insert(invoiceItems).values(
        q.items.map((it, idx) => ({
          invoiceId: invRow.id,
          position: idx,
          description: it.description,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
        })),
      );
    }

    await tx
      .update(quotes)
      .set({
        convertedInvoiceId: invRow.id,
        status: 'accepted',
        updatedAt: new Date(),
      })
      .where(eq(quotes.id, q.id));

    return invRow;
  });

  revalidatePath('/admin', 'layout');
  return { invoiceId: result.id, invoiceNumber: result.number };
}

export async function getQuote(id: string): Promise<QuoteWithItems | null> {
  const [row] = await db
    .select({
      q: quotes,
      c_id: customers.id,
      c_name: customers.name,
      c_attention: customers.attention,
      c_addressLine: customers.addressLine,
    })
    .from(quotes)
    .innerJoin(customers, eq(customers.id, quotes.customerId))
    .where(eq(quotes.id, id))
    .limit(1);
  if (!row) return null;
  const items = await db
    .select()
    .from(quoteItems)
    .where(eq(quoteItems.quoteId, id))
    .orderBy(quoteItems.position);
  return {
    ...row.q,
    customer: {
      id: row.c_id,
      name: row.c_name,
      attention: row.c_attention,
      addressLine: row.c_addressLine,
    },
    items,
  };
}

export async function listQuotes(opts?: {
  status?: string;
  customerId?: string;
  year?: number;
  q?: string;
  from?: string;
  to?: string;
  sort?: 'number' | 'issueDate' | 'createdAt' | 'title';
  dir?: 'asc' | 'desc';
}): Promise<(Quote & { customerName: string; customerAttention: string | null })[]> {
  const conds: SQL[] = [];
  if (opts?.status) conds.push(eq(quotes.status, opts.status));
  if (opts?.customerId) conds.push(eq(quotes.customerId, opts.customerId));
  if (opts?.year) conds.push(sql`extract(year from ${quotes.issueDate}) = ${opts.year}`);
  if (opts?.from && isISODate(opts.from)) conds.push(gte(quotes.issueDate, opts.from));
  if (opts?.to && isISODate(opts.to)) conds.push(lte(quotes.issueDate, opts.to));
  if (opts?.q) {
    const pat = `%${opts.q}%`;
    conds.push(sql`(${quotes.title} ILIKE ${pat} OR ${quotes.number} ILIKE ${pat} OR ${customers.name} ILIKE ${pat})`);
  }

  const sortCol =
    opts?.sort === 'number'
      ? quotes.number
      : opts?.sort === 'issueDate'
        ? quotes.issueDate
        : opts?.sort === 'title'
          ? quotes.title
          : quotes.createdAt;
  const ordered = opts?.dir === 'asc' ? sortCol : desc(sortCol);

  return await db
    .select({
      id: quotes.id,
      number: quotes.number,
      customerId: quotes.customerId,
      title: quotes.title,
      issueDate: quotes.issueDate,
      validUntil: quotes.validUntil,
      gstPercent: quotes.gstPercent,
      terms: quotes.terms,
      notes: quotes.notes,
      status: quotes.status,
      convertedInvoiceId: quotes.convertedInvoiceId,
      createdAt: quotes.createdAt,
      updatedAt: quotes.updatedAt,
      customerName: customers.name,
      customerAttention: customers.attention,
    })
    .from(quotes)
    .innerJoin(customers, eq(customers.id, quotes.customerId))
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
