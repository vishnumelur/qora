import Link from 'next/link';
import { Plus, Search, ArrowUpRight } from 'lucide-react';
import { listCustomers } from '@/server/actions/customers';

export const dynamic = 'force-dynamic';

export default async function CustomersPage(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await props.searchParams;
  const rows = await listCustomers({ q: sp.q });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">Customers</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {rows.length} customer{rows.length === 1 ? '' : 's'} in your book
          </p>
        </div>
        <Link
          href="/admin/customers/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[#1a2744] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#0f1829] hover:shadow-md"
        >
          <Plus className="size-4" />
          New customer
        </Link>
      </div>

      <form className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400 pointer-events-none" />
        <input
          type="search"
          name="q"
          defaultValue={sp.q ?? ''}
          placeholder="Search by name or contact"
          className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-9 pr-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500"
        />
      </form>

      <div className="rounded-2xl bg-white ring-1 ring-neutral-200/70 shadow-sm overflow-hidden">
        {rows.length === 0 && (
          <p className="px-5 py-12 text-center text-sm text-neutral-500">
            {sp.q ? 'No customers match your search.' : 'No customers yet.'}
          </p>
        )}
        <ul className="divide-y divide-neutral-100">
          {rows.map((c) => (
            <li key={c.id}>
              <Link
                href={`/admin/customers/${c.id}`}
                className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-neutral-50"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#1a2744]/5 text-[#1a2744] font-semibold">
                  {c.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-neutral-900">{c.name}</div>
                  <div className="truncate text-xs text-neutral-500 mt-0.5">
                    {[c.attention, c.addressLine, c.email].filter(Boolean).join(' · ') || '—'}
                  </div>
                </div>
                <ArrowUpRight className="size-4 text-neutral-400" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
