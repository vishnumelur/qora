import Link from 'next/link';
import { eq } from 'drizzle-orm';
import {
  ArrowUpRight,
  FileText,
  IndianRupee,
  Plus,
  Receipt,
  Users,
} from 'lucide-react';
import { listQuotes } from '@/server/actions/quotes';
import { listInvoices } from '@/server/actions/invoices';
import { listCustomers } from '@/server/actions/customers';
import { db } from '@/server/db/client';
import { invoiceItems, payments } from '@/server/db/schema';
import { inr } from '@/server/pdf/format';
import { recordTotalsWithPayments } from '@/server/domain/totals';
import { StatCard } from '@/components/admin/ui/stat-card';
import { StatusBadge } from '@/components/admin/ui/status-badge';
import { FromQuoteTag } from '@/components/admin/ui/from-quote-tag';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [quotesAll, invoicesAll, customersAll] = await Promise.all([
    listQuotes(),
    listInvoices(),
    listCustomers(),
  ]);

  const recentQuotes = quotesAll.slice(0, 5);
  const recentInvoices = invoicesAll.slice(0, 5);

  // Real outstanding = sum of actual unpaid balances (uses payments table)
  let outstanding = 0;
  let paidTotal = 0;
  for (const inv of invoicesAll) {
    const [items, pays] = await Promise.all([
      db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, inv.id)),
      db.select({ amount: payments.amount }).from(payments).where(eq(payments.invoiceId, inv.id)),
    ]);
    const m = recordTotalsWithPayments(items, inv.gstPercent, pays);
    paidTotal += m.paid;
    if (m.outstanding > 0) outstanding += m.outstanding;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Overview of your quotes, invoices, and outstanding balances.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/quotes/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1a2744] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#0f1829] hover:shadow-md"
          >
            <Plus className="size-4" />
            New quote
          </Link>
          <Link
            href="/admin/invoices/new"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 ring-1 ring-neutral-200 transition-all hover:bg-neutral-50"
          >
            <Plus className="size-4" />
            New invoice
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Outstanding"
          value={inr(outstanding)}
          hint={`${invoicesAll.filter((i) => i.status !== 'paid').length} unpaid`}
          icon={IndianRupee}
          tone="navy"
        />
        <StatCard
          label="Paid this period"
          value={inr(paidTotal)}
          hint={`${invoicesAll.filter((i) => i.status === 'paid').length} paid invoices`}
          icon={Receipt}
          tone="emerald"
        />
        <StatCard
          label="Total quotes"
          value={String(quotesAll.length)}
          hint={`${quotesAll.filter((q) => q.status === 'accepted').length} accepted`}
          icon={FileText}
        />
        <StatCard
          label="Customers"
          value={String(customersAll.length)}
          hint="Active in book"
          icon={Users}
        />
      </div>

      {/* Recent lists — two columns desktop, stacked mobile */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentSection
          title="Recent quotes"
          allHref="/admin/quotes"
          rows={recentQuotes}
          basePath="/admin/quotes"
        />
        <RecentSection
          title="Recent invoices"
          allHref="/admin/invoices"
          rows={recentInvoices}
          basePath="/admin/invoices"
        />
      </div>
    </div>
  );
}

function RecentSection({
  title,
  allHref,
  rows,
  basePath,
}: {
  title: string;
  allHref: string;
  rows: {
    id: string;
    number: string;
    title: string;
    status: string;
    customerName: string;
    customerAttention: string | null;
    sourceQuoteId?: string | null;
  }[];
  basePath: string;
}) {
  return (
    <section className="rounded-2xl bg-white ring-1 ring-neutral-200/70 shadow-sm">
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
        <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
        <Link
          href={allHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-cyan-700 hover:text-cyan-900"
        >
          View all
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
      <ul className="divide-y divide-neutral-100">
        {rows.length === 0 && (
          <li className="px-5 py-8 text-center text-sm text-neutral-500">Nothing yet.</li>
        )}
        {rows.map((r) => (
          <li key={r.id}>
            <Link
              href={`${basePath}/${r.id}`}
              className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-neutral-50"
            >
              <span className="w-28 shrink-0">
                <span className="block font-mono text-xs text-neutral-500 truncate">
                  {r.number}
                </span>
                {r.sourceQuoteId && (
                  <span className="mt-1 block">
                    <FromQuoteTag />
                  </span>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-neutral-900">{r.title}</span>
                {(r.customerName || r.customerAttention) && (
                  <span className="block truncate text-[11px] text-neutral-500 mt-0.5">
                    {[r.customerName, r.customerAttention].filter(Boolean).join(' · ')}
                  </span>
                )}
              </span>
              <StatusBadge status={r.status} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
