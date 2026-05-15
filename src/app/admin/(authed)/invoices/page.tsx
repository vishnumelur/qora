import Link from 'next/link';
import { eq } from 'drizzle-orm';
import { Plus, Search } from 'lucide-react';
import { listInvoices } from '@/server/actions/invoices';
import { db } from '@/server/db/client';
import { invoiceItems, payments } from '@/server/db/schema';
import { inr } from '@/server/pdf/format';
import { recordTotalsWithPayments, deriveInvoiceStatus } from '@/server/domain/totals';
import { StatusSelect } from '@/components/admin/ui/status-select';
import { FromQuoteTag } from '@/components/admin/ui/from-quote-tag';
import { FilterChips } from '@/components/admin/ui/filter-chips';
import { SortHeader } from '@/components/admin/ui/sort-header';
import { StatCard } from '@/components/admin/ui/stat-card';
import { IndianRupee } from 'lucide-react';

export const dynamic = 'force-dynamic';

type SP = {
  status?: string;
  q?: string;
  from?: string;
  to?: string;
  sort?: 'number' | 'issueDate' | 'createdAt' | 'title' | 'dueDate';
  dir?: 'asc' | 'desc';
};

export default async function InvoicesPage(props: { searchParams: Promise<SP> }) {
  const sp = await props.searchParams;

  const fromParam = sp.from?.trim() || undefined;
  const toParam = sp.to?.trim() || undefined;
  const qParam = sp.q?.trim() || undefined;

  const all = await listInvoices();
  const rows =
    sp.status || qParam || sp.sort || fromParam || toParam
      ? await listInvoices({
          status: sp.status,
          q: qParam,
          from: fromParam,
          to: toParam,
          sort: sp.sort,
          dir: sp.dir,
        })
      : all;

  const clearHref = (() => {
    const params = new URLSearchParams();
    if (sp.status) params.set('status', sp.status);
    if (sp.sort) params.set('sort', sp.sort);
    if (sp.dir) params.set('dir', sp.dir);
    const qs = params.toString();
    return `/admin/invoices${qs ? `?${qs}` : ''}`;
  })();
  const hasFilterToClear = Boolean(qParam || fromParam || toParam);

  // For each invoice, compute total + paid + outstanding from items + payments
  let outstanding = 0;
  const moneyById = new Map<string, { total: number; paid: number; outstanding: number; derived: ReturnType<typeof deriveInvoiceStatus> }>();
  for (const r of all) {
    const [items, pays] = await Promise.all([
      db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, r.id)),
      db.select({ amount: payments.amount }).from(payments).where(eq(payments.invoiceId, r.id)),
    ]);
    const m = recordTotalsWithPayments(items, r.gstPercent, pays);
    const derived = deriveInvoiceStatus(r.status, m.total, m.paid);
    moneyById.set(r.id, { total: m.total, paid: m.paid, outstanding: m.outstanding, derived });
    if (derived !== 'paid' && m.outstanding > 0) outstanding += m.outstanding;
  }

  const count = (status?: string) =>
    status ? all.filter((i) => i.status === status).length : all.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">Invoices</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {all.length} total · {count('paid')} paid · {count('sent') + count('draft')} open
          </p>
        </div>
        <Link
          href="/admin/invoices/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[#1a2744] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#0f1829] hover:shadow-md"
        >
          <Plus className="size-4" />
          New invoice
        </Link>
      </div>

      <StatCard
        label="Outstanding total"
        value={inr(outstanding)}
        hint={`${count() - count('paid')} unpaid invoices`}
        icon={IndianRupee}
        tone="navy"
        className="max-w-md"
      />

      {/* Status chips */}
      <FilterChips
        basePath="/admin/invoices"
        chips={[
          { label: 'All', value: null, count: count() },
          { label: 'Draft', value: 'draft', count: count('draft') },
          { label: 'Sent', value: 'sent', count: count('sent') },
          { label: 'Paid', value: 'paid', count: count('paid') },
        ]}
      />

      {/* Refine: search + date range */}
      <form className="flex flex-wrap items-center gap-3 rounded-2xl bg-white ring-1 ring-neutral-200/70 shadow-sm px-3 py-2.5">
        {sp.status && <input type="hidden" name="status" value={sp.status} />}
        {sp.sort && <input type="hidden" name="sort" value={sp.sort} />}
        {sp.dir && <input type="hidden" name="dir" value={sp.dir} />}

        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <input
            type="search"
            name="q"
            defaultValue={qParam ?? ''}
            placeholder="Search by number, title, customer"
            className="w-full rounded-xl border border-neutral-200 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            From
            <input
              type="date"
              name="from"
              defaultValue={fromParam ?? ''}
              className="rounded-xl border border-neutral-200 bg-white py-2 px-2.5 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500"
            />
          </label>
          <label className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            To
            <input
              type="date"
              name="to"
              defaultValue={toParam ?? ''}
              className="rounded-xl border border-neutral-200 bg-white py-2 px-2.5 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500"
            />
          </label>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {hasFilterToClear && (
            <Link
              href={clearHref}
              className="text-xs font-medium text-neutral-500 hover:text-neutral-900"
            >
              Clear
            </Link>
          )}
          <button
            type="submit"
            className="rounded-xl bg-[#1a2744] px-4 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-[#0f1829]"
          >
            Apply
          </button>
        </div>
      </form>

      <div className="rounded-2xl bg-white ring-1 ring-neutral-200/70 shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-3 border-b border-neutral-100 px-5 py-3 text-[11px] uppercase tracking-wider text-neutral-500">
          <div className="col-span-2">
            <SortHeader field="number" label="Number" basePath="/admin/invoices" />
          </div>
          <div className="col-span-4">
            <SortHeader field="title" label="Title / Customer" basePath="/admin/invoices" />
          </div>
          <div className="col-span-2">
            <SortHeader field="issueDate" label="Issued" basePath="/admin/invoices" />
          </div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Total</div>
        </div>

        <ul className="divide-y divide-neutral-100">
          {rows.length === 0 && (
            <li className="px-5 py-12 text-center text-sm text-neutral-500">
              No invoices match the current filters.
            </li>
          )}
          {rows.map((inv) => (
            <li key={inv.id} className="relative transition-colors hover:bg-neutral-50">
              <Link
                href={`/admin/invoices/${inv.id}`}
                aria-label={`Open invoice ${inv.number}`}
                className="absolute inset-0"
              />
              <div className="relative pointer-events-none px-5 py-4">
                <div className="hidden md:grid grid-cols-12 gap-3 items-center text-sm">
                  <div className="col-span-2 space-y-1">
                    <div className="font-mono text-neutral-700">{inv.number}</div>
                    {inv.sourceQuoteId && <FromQuoteTag />}
                  </div>
                  <div className="col-span-4 min-w-0">
                    <div className="truncate font-medium text-neutral-900">{inv.title}</div>
                    <div className="truncate text-xs text-neutral-500 mt-0.5">
                      {inv.customerName}
                      {inv.dueDate ? ` · Due ${inv.dueDate}` : ''}
                    </div>
                  </div>
                  <div className="col-span-2 text-neutral-600">{inv.issueDate}</div>
                  <div className="col-span-2 pointer-events-auto relative z-10">
                    <StatusSelect kind="invoice" id={inv.id} status={inv.status} />
                  </div>
                  <div className="col-span-2 text-right">
                    <div className="font-mono tabular-nums font-medium">
                      {inr(moneyById.get(inv.id)?.total ?? 0)}
                    </div>
                    {(() => {
                      const m = moneyById.get(inv.id);
                      if (m && m.paid > 0 && m.outstanding > 0) {
                        return (
                          <div className="text-[11px] text-neutral-500 font-mono tabular-nums">
                            {inr(m.outstanding)} due
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>

                <div className="md:hidden space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5">
                      <span className="font-mono text-xs text-neutral-500">{inv.number}</span>
                      {inv.sourceQuoteId && <FromQuoteTag />}
                    </span>
                    <div className="pointer-events-auto relative z-10">
                      <StatusSelect kind="invoice" id={inv.id} status={inv.status} />
                    </div>
                  </div>
                  <div className="text-sm font-medium text-neutral-900 line-clamp-2">{inv.title}</div>
                  <div className="flex items-center justify-between gap-2 text-xs text-neutral-500">
                    <span className="truncate">
                      {inv.customerName} · Issued {inv.issueDate}
                    </span>
                    <span className="font-mono tabular-nums font-medium text-neutral-900 shrink-0">
                      {inr(moneyById.get(inv.id)?.total ?? 0)}
                    </span>
                  </div>
                  {(() => {
                    const m = moneyById.get(inv.id);
                    if (m && m.paid > 0 && m.outstanding > 0) {
                      return (
                        <div className="text-[11px] text-neutral-500 font-mono tabular-nums text-right">
                          {inr(m.outstanding)} due
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
