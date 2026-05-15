import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { db } from '@/server/db/client';
import { invoices } from '@/server/db/schema';
import { getQuote } from '@/server/actions/quotes';
import { inr } from '@/server/pdf/format';
import { recordTotals } from '@/server/domain/totals';
import { QuoteActions } from '@/components/admin/quote-actions';
import { StatusBadge } from '@/components/admin/ui/status-badge';

export const dynamic = 'force-dynamic';

export default async function QuoteViewPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const q = await getQuote(id);
  if (!q) notFound();
  const totals = recordTotals(q.items, q.gstPercent);

  let convertedInvoice: { id: string; number: string } | null = null;
  if (q.convertedInvoiceId) {
    const [row] = await db
      .select({ id: invoices.id, number: invoices.number })
      .from(invoices)
      .where(eq(invoices.id, q.convertedInvoiceId))
      .limit(1);
    convertedInvoice = row ?? null;
  }

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-neutral-500">{q.number}</span>
            <StatusBadge status={q.status} size="md" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">{q.title}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-500">
            <span>Issued <span className="text-neutral-700 font-medium">{q.issueDate}</span></span>
            <span>Valid until <span className="text-neutral-700 font-medium">{q.validUntil}</span></span>
          </div>
        </div>

        {/* Customer card */}
        <aside className="rounded-2xl bg-white ring-1 ring-neutral-200/70 shadow-sm p-5">
          <div className="text-[11px] uppercase tracking-wider text-neutral-500 mb-2">
            Quotation for
          </div>
          <div className="text-base font-semibold text-neutral-900">{q.customer.name}</div>
          {q.customer.attention && (
            <div className="text-sm text-neutral-600 mt-1">KIND ATTN: {q.customer.attention}</div>
          )}
          {q.customer.addressLine && (
            <div className="text-sm text-neutral-600">{q.customer.addressLine}</div>
          )}
        </aside>
      </div>

      <QuoteActions id={q.id} status={q.status} convertedInvoiceId={q.convertedInvoiceId} />

      {convertedInvoice && (
        <Link
          href={`/admin/invoices/${convertedInvoice.id}`}
          className="group flex items-center justify-between gap-2 rounded-2xl bg-emerald-50 ring-1 ring-emerald-200/70 px-5 py-3 text-sm transition-colors hover:bg-emerald-100/60"
        >
          <span className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="size-4" />
            Converted to invoice
            <span className="font-mono font-semibold">{convertedInvoice.number}</span>
          </span>
          <ArrowUpRight className="size-4 text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      )}

      {/* Items */}
      <div className="rounded-2xl bg-white ring-1 ring-neutral-200/70 shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-3 border-b border-neutral-100 px-5 py-3 text-[11px] uppercase tracking-wider font-medium text-neutral-500">
          <div className="col-span-6">Description</div>
          <div className="col-span-2 text-right">Qty</div>
          <div className="col-span-2 text-right">Unit Price</div>
          <div className="col-span-2 text-right">Subtotal</div>
        </div>
        <ul className="divide-y divide-neutral-100">
          {q.items.map((it) => (
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

      {/* Totals */}
      <div className="ml-auto max-w-sm rounded-2xl bg-white ring-1 ring-neutral-200/70 shadow-sm overflow-hidden">
        <div className="px-5 py-3 flex justify-between text-sm">
          <span className="text-neutral-500">Subtotal</span>
          <span className="font-mono tabular-nums">{inr(totals.subtotal)}</span>
        </div>
        <div className="px-5 py-3 border-t border-neutral-100 flex justify-between text-sm">
          <span className="text-neutral-500">GST {q.gstPercent}%</span>
          <span className="font-mono tabular-nums">{inr(totals.gstAmount)}</span>
        </div>
        <div className="px-5 py-4 border-t border-neutral-100 bg-[#1a2744] text-white flex justify-between items-baseline">
          <span className="text-sm font-medium">Total</span>
          <span className="font-mono tabular-nums text-xl font-semibold">{inr(totals.total)}</span>
        </div>
      </div>

      {q.notes && (
        <div className="rounded-2xl bg-amber-50 ring-1 ring-amber-200/70 px-5 py-4">
          <div className="text-xs uppercase tracking-wider font-medium text-amber-700 mb-1">Notes</div>
          <div className="text-sm text-amber-900 whitespace-pre-wrap">{q.notes}</div>
        </div>
      )}

      <div className="rounded-2xl bg-white ring-1 ring-neutral-200/70 shadow-sm p-5">
        <div className="text-xs uppercase tracking-wider font-medium text-neutral-500 mb-2">
          Terms &amp; Conditions
        </div>
        <ul className="text-sm text-neutral-700 space-y-1 list-disc pl-5">
          {q.terms
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
