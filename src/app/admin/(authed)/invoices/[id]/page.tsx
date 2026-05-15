import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { ArrowUpRight } from 'lucide-react';
import { db } from '@/server/db/client';
import { quotes } from '@/server/db/schema';
import { getInvoice } from '@/server/actions/invoices';
import { inr } from '@/server/pdf/format';
import { recordTotalsWithPayments, deriveInvoiceStatus } from '@/server/domain/totals';
import { InvoiceActions } from '@/components/admin/invoice-actions';
import { InvoicePayments } from '@/components/admin/invoice-payments';
import { StatusBadge } from '@/components/admin/ui/status-badge';

export const dynamic = 'force-dynamic';

export default async function InvoiceViewPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const inv = await getInvoice(id);
  if (!inv) notFound();
  const totals = recordTotalsWithPayments(inv.items, inv.gstPercent, inv.payments);
  const derived = deriveInvoiceStatus(inv.status, totals.total, totals.paid);

  let sourceQuote: { id: string; number: string } | null = null;
  if (inv.sourceQuoteId) {
    const [row] = await db
      .select({ id: quotes.id, number: quotes.number })
      .from(quotes)
      .where(eq(quotes.id, inv.sourceQuoteId))
      .limit(1);
    sourceQuote = row ?? null;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-neutral-500">{inv.number}</span>
            <StatusBadge status={derived} size="md" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">{inv.title}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-500">
            <span>Issued <span className="text-neutral-700 font-medium">{inv.issueDate}</span></span>
            {inv.dueDate && (
              <span>Due <span className="text-neutral-700 font-medium">{inv.dueDate}</span></span>
            )}
            {inv.paidOn && (
              <span>Paid <span className="text-emerald-700 font-medium">{inv.paidOn}</span></span>
            )}
          </div>
        </div>

        <aside className="rounded-2xl bg-white ring-1 ring-neutral-200/70 shadow-sm p-5">
          <div className="text-[11px] uppercase tracking-wider text-neutral-500 mb-2">
            Invoice to
          </div>
          <div className="text-base font-semibold text-neutral-900">{inv.customer.name}</div>
          {inv.customer.attention && (
            <div className="text-sm text-neutral-600 mt-1">KIND ATTN: {inv.customer.attention}</div>
          )}
          {inv.customer.addressLine && (
            <div className="text-sm text-neutral-600">{inv.customer.addressLine}</div>
          )}
        </aside>
      </div>

      <InvoiceActions id={inv.id} status={inv.status} />

      {sourceQuote && (
        <Link
          href={`/admin/quotes/${sourceQuote.id}`}
          className="group flex items-center justify-between gap-2 rounded-2xl bg-neutral-50 ring-1 ring-neutral-200 px-5 py-3 text-sm transition-colors hover:bg-neutral-100"
        >
          <span className="text-neutral-700">
            Converted from quote{' '}
            <span className="font-mono font-semibold text-neutral-900">{sourceQuote.number}</span>
          </span>
          <ArrowUpRight className="size-4 text-neutral-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      )}

      <div className="rounded-2xl bg-white ring-1 ring-neutral-200/70 shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-3 border-b border-neutral-100 px-5 py-3 text-[11px] uppercase tracking-wider font-medium text-neutral-500">
          <div className="col-span-6">Description</div>
          <div className="col-span-2 text-right">Qty</div>
          <div className="col-span-2 text-right">Unit Price</div>
          <div className="col-span-2 text-right">Subtotal</div>
        </div>
        <ul className="divide-y divide-neutral-100">
          {inv.items.map((it) => (
            <li key={it.id} className="px-5 py-3">
              <div className="hidden md:grid grid-cols-12 gap-3 items-center text-sm">
                <div className="col-span-6 text-neutral-900">{it.description}</div>
                <div className="col-span-2 text-right text-neutral-700 tabular-nums">{it.quantity}</div>
                <div className="col-span-2 text-right font-mono tabular-nums">{inr(it.unitPrice)}</div>
                <div className="col-span-2 text-right font-mono tabular-nums font-medium">
                  {inr(Number(it.quantity) * Number(it.unitPrice))}
                </div>
              </div>
              <div className="md:hidden space-y-1">
                <div className="text-sm font-medium text-neutral-900">{it.description}</div>
                <div className="flex justify-between text-xs text-neutral-600">
                  <span>{it.quantity} × {inr(it.unitPrice)}</span>
                  <span className="font-mono font-medium text-neutral-900">
                    {inr(Number(it.quantity) * Number(it.unitPrice))}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="ml-auto max-w-sm rounded-2xl bg-white ring-1 ring-neutral-200/70 shadow-sm overflow-hidden">
        <div className="px-5 py-3 flex justify-between text-sm">
          <span className="text-neutral-500">Subtotal</span>
          <span className="font-mono tabular-nums">{inr(totals.subtotal)}</span>
        </div>
        <div className="px-5 py-3 border-t border-neutral-100 flex justify-between text-sm">
          <span className="text-neutral-500">GST {inv.gstPercent}%</span>
          <span className="font-mono tabular-nums">{inr(totals.gstAmount)}</span>
        </div>
        <div className="px-5 py-3 border-t border-neutral-100 bg-[#1a2744] text-white flex justify-between items-baseline">
          <span className="text-sm font-medium">Total</span>
          <span className="font-mono tabular-nums text-xl font-semibold">{inr(totals.total)}</span>
        </div>
        {totals.paid > 0 && (
          <div className="px-5 py-3 border-t border-emerald-100 bg-emerald-50 flex justify-between text-sm">
            <span className="text-emerald-700">Paid so far</span>
            <span className="font-mono tabular-nums font-medium text-emerald-700">
              {inr(totals.paid)}
            </span>
          </div>
        )}
        {totals.outstanding > 0 && totals.paid > 0 && (
          <div className="px-5 py-3 border-t border-neutral-100 flex justify-between text-sm">
            <span className="text-neutral-700 font-medium">Outstanding</span>
            <span className="font-mono tabular-nums font-semibold text-neutral-900">
              {inr(totals.outstanding)}
            </span>
          </div>
        )}
        {totals.outstanding < 0 && (
          <div className="px-5 py-3 border-t border-amber-100 bg-amber-50 flex justify-between text-sm">
            <span className="text-amber-700 font-medium">Overpaid by</span>
            <span className="font-mono tabular-nums font-semibold text-amber-900">
              {inr(Math.abs(totals.outstanding))}
            </span>
          </div>
        )}
      </div>

      <InvoicePayments
        invoiceId={inv.id}
        payments={inv.payments}
        total={totals.total}
        paid={totals.paid}
        outstanding={totals.outstanding}
      />

      {inv.notes && (
        <div className="rounded-2xl bg-amber-50 ring-1 ring-amber-200/70 px-5 py-4">
          <div className="text-xs uppercase tracking-wider font-medium text-amber-700 mb-1">Notes</div>
          <div className="text-sm text-amber-900 whitespace-pre-wrap">{inv.notes}</div>
        </div>
      )}

      <div className="rounded-2xl bg-white ring-1 ring-neutral-200/70 shadow-sm p-5">
        <div className="text-xs uppercase tracking-wider font-medium text-neutral-500 mb-2">
          Terms &amp; Conditions
        </div>
        <ul className="text-sm text-neutral-700 space-y-1 list-disc pl-5">
          {inv.terms
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean)
            .map((line, i) => (
              <li key={i}>{line}</li>
            ))}
        </ul>
      </div>
    </div>
  );
}
