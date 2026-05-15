'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Download, Pencil, Receipt, Trash2 } from 'lucide-react';
import {
  setQuoteStatusAction,
  duplicateQuoteAction,
  convertQuoteToInvoiceAction,
  deleteQuoteAction,
} from '@/server/actions/quotes';

type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected';

export function QuoteActions({
  id,
  status,
  convertedInvoiceId,
}: {
  id: string;
  status: string;
  convertedInvoiceId: string | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white ring-1 ring-neutral-200/70 shadow-sm p-3">
      <a
        href={`/api/admin/quotes/${id}/pdf`}
        className="inline-flex items-center gap-1.5 rounded-xl bg-[#1a2744] px-3.5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#0f1829] hover:shadow"
      >
        <Download className="size-4" />
        Download PDF
      </a>
      <a
        href={`/admin/quotes/${id}/edit`}
        className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-sm font-medium text-neutral-700 ring-1 ring-neutral-200 transition-all hover:bg-neutral-50"
      >
        <Pencil className="size-4" />
        Edit
      </a>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await duplicateQuoteAction(id);
            if (r) router.push(`/admin/quotes/${r.id}`);
          })
        }
        className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-sm font-medium text-neutral-700 ring-1 ring-neutral-200 transition-all hover:bg-neutral-50 disabled:opacity-50"
      >
        <Copy className="size-4" />
        Duplicate
      </button>
      {!convertedInvoiceId && (
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await convertQuoteToInvoiceAction(id);
              if (r) router.push(`/admin/invoices/${r.invoiceId}/edit`);
            })
          }
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow disabled:opacity-50"
        >
          <Receipt className="size-4" />
          Convert to Invoice
        </button>
      )}
      <div className="ml-auto flex items-center gap-2">
        <select
          key={status}
          defaultValue={status}
          disabled={pending}
          onChange={(e) =>
            start(async () => {
              await setQuoteStatusAction(id, e.target.value as QuoteStatus);
              router.refresh();
            })
          }
          className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500"
        >
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              setError(null);
              if (!confirm('Delete this quote? This cannot be undone.')) return;
              const res = await deleteQuoteAction(id);
              if (!res.ok) {
                setError(res.error);
                return;
              }
              router.push('/admin/quotes');
            })
          }
          className="inline-flex items-center justify-center size-9 rounded-xl text-rose-600 hover:bg-rose-50 disabled:opacity-50"
          aria-label="Delete quote"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
      {error && (
        <div
          role="alert"
          className="basis-full rounded-xl bg-rose-50 ring-1 ring-rose-200 px-4 py-2.5 text-sm text-rose-700"
        >
          {error}
        </div>
      )}
    </div>
  );
}
