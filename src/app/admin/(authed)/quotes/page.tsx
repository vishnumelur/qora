import Link from 'next/link';
import { eq } from 'drizzle-orm';
import { Plus, Search } from 'lucide-react';
import { listQuotes } from '@/server/actions/quotes';
import { db } from '@/server/db/client';
import { quoteItems } from '@/server/db/schema';
import { inr } from '@/server/pdf/format';
import { recordTotals } from '@/server/domain/totals';
import { StatusSelect } from '@/components/admin/ui/status-select';
import { FilterChips } from '@/components/admin/ui/filter-chips';
import { SortHeader } from '@/components/admin/ui/sort-header';

export const dynamic = 'force-dynamic';

type SP = {
  status?: string;
  q?: string;
  from?: string;
  to?: string;
  sort?: 'number' | 'issueDate' | 'createdAt' | 'title';
  dir?: 'asc' | 'desc';
};

export default async function QuotesPage(props: { searchParams: Promise<SP> }) {
  const sp = await props.searchParams;

  const fromParam = sp.from?.trim() || undefined;
  const toParam = sp.to?.trim() || undefined;
  const qParam = sp.q?.trim() || undefined;

  // Always fetch the unfiltered list once for accurate chip counts.
  const all = await listQuotes();
  const rows =
    sp.status || qParam || sp.sort || fromParam || toParam
      ? await listQuotes({
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
    return `/admin/quotes${qs ? `?${qs}` : ''}`;
  })();
  const hasFilterToClear = Boolean(qParam || fromParam || toParam);

  const totalsById = new Map<string, number>();
  for (const r of rows) {
    const items = await db.select().from(quoteItems).where(eq(quoteItems.quoteId, r.id));
    totalsById.set(r.id, recordTotals(items, r.gstPercent).total);
  }

  const count = (status?: string) =>
    status ? all.filter((q) => q.status === status).length : all.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">Quotes</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {all.length} total · {count('accepted')} accepted · {count('draft')} draft
          </p>
        </div>
        <Link
          href="/admin/quotes/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[#1a2744] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#0f1829] hover:shadow-md"
        >
          <Plus className="size-4" />
          New quote
        </Link>
      </div>

      {/* Status chips */}
      <FilterChips
        basePath="/admin/quotes"
        chips={[
          { label: 'All', value: null, count: count() },
          { label: 'Draft', value: 'draft', count: count('draft') },
          { label: 'Sent', value: 'sent', count: count('sent') },
          { label: 'Accepted', value: 'accepted', count: count('accepted') },
          { label: 'Rejected', value: 'rejected', count: count('rejected') },
        ]}
      />

      {/* Refine: search + date range */}
      <form className="flex flex-wrap items-center gap-3 rounded-2xl bg-white ring-1 ring-neutral-200/70 shadow-sm px-3 py-2.5">
        {/* Preserve other filter params on submit */}
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

      {/* Table */}
      <div className="rounded-2xl bg-white ring-1 ring-neutral-200/70 shadow-sm overflow-hidden">
        {/* Desktop table header */}
        <div className="hidden md:grid grid-cols-12 gap-3 border-b border-neutral-100 px-5 py-3 text-[11px] uppercase tracking-wider text-neutral-500">
          <div className="col-span-2">
            <SortHeader field="number" label="Number" basePath="/admin/quotes" />
          </div>
          <div className="col-span-4">
            <SortHeader field="title" label="Title / Customer" basePath="/admin/quotes" />
          </div>
          <div className="col-span-2">
            <SortHeader field="issueDate" label="Issued" basePath="/admin/quotes" />
          </div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Total</div>
        </div>

        <ul className="divide-y divide-neutral-100">
          {rows.length === 0 && (
            <li className="px-5 py-12 text-center text-sm text-neutral-500">
              No quotes match the current filters.
            </li>
          )}
          {rows.map((q) => (
            <li key={q.id} className="relative transition-colors hover:bg-neutral-50">
              <Link
                href={`/admin/quotes/${q.id}`}
                aria-label={`Open quote ${q.number}`}
                className="absolute inset-0"
              />
              <div className="relative pointer-events-none px-5 py-4">
                {/* Desktop row */}
                <div className="hidden md:grid grid-cols-12 gap-3 items-center text-sm">
                  <div className="col-span-2 font-mono text-neutral-700">{q.number}</div>
                  <div className="col-span-4 min-w-0">
                    <div className="truncate font-medium text-neutral-900">{q.title}</div>
                    <div className="truncate text-xs text-neutral-500 mt-0.5">
                      {q.customerName}
                    </div>
                  </div>
                  <div className="col-span-2 text-neutral-600">{q.issueDate}</div>
                  <div className="col-span-2 pointer-events-auto relative z-10">
                    <StatusSelect kind="quote" id={q.id} status={q.status} />
                  </div>
                  <div className="col-span-2 text-right font-mono tabular-nums font-medium">
                    {inr(totalsById.get(q.id) ?? 0)}
                  </div>
                </div>

                {/* Mobile card layout */}
                <div className="md:hidden space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-neutral-500">{q.number}</span>
                    <div className="pointer-events-auto relative z-10">
                      <StatusSelect kind="quote" id={q.id} status={q.status} />
                    </div>
                  </div>
                  <div className="text-sm font-medium text-neutral-900 line-clamp-2">{q.title}</div>
                  <div className="flex items-center justify-between gap-2 text-xs text-neutral-500">
                    <span className="truncate">{q.customerName} · {q.issueDate}</span>
                    <span className="font-mono tabular-nums font-medium text-neutral-900 shrink-0">
                      {inr(totalsById.get(q.id) ?? 0)}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
