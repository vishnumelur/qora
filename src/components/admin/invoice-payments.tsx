'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Receipt, Trash2, X } from 'lucide-react';
import {
  recordPaymentAction,
  deletePaymentAction,
} from '@/server/actions/invoices';
import { inr } from '@/server/pdf/format';
import { cn } from '@/lib/utils';
import type { Payment } from '@/server/db/schema';

const METHOD_LABEL: Record<string, string> = {
  bank_transfer: 'Bank transfer',
  upi: 'UPI',
  cash: 'Cash',
  cheque: 'Cheque',
  card: 'Card',
  other: 'Other',
};

export function InvoicePayments({
  invoiceId,
  payments,
  total,
  paid,
  outstanding,
}: {
  invoiceId: string;
  payments: Payment[];
  total: number;
  paid: number;
  outstanding: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);
  const fullyPaid = outstanding <= 0 && total > 0;

  return (
    <div className="rounded-2xl bg-white ring-1 ring-neutral-200/70 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <Receipt className="size-4 text-neutral-500" />
          <h2 className="text-sm font-semibold text-neutral-900">Payments</h2>
        </div>
        {!fullyPaid && !open && (
          <button
            type="button"
            onClick={() => {
              setOpen(true);
              setError(null);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-700"
          >
            <Plus className="size-3.5" />
            Record payment
          </button>
        )}
      </div>

      {/* Record-payment inline form */}
      {open && !fullyPaid && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            start(async () => {
              const res = await recordPaymentAction(invoiceId, {
                amount: String(fd.get('amount') ?? ''),
                paidOn: String(fd.get('paidOn') ?? ''),
                method: String(fd.get('method') ?? 'bank_transfer'),
                reference: String(fd.get('reference') ?? ''),
                notes: String(fd.get('notes') ?? ''),
              });
              if (!res.ok) {
                setError(res.error);
                return;
              }
              setOpen(false);
              setError(null);
              router.refresh();
            });
          }}
          className="border-b border-neutral-100 bg-neutral-50/60 px-5 py-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
              New payment
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setError(null);
              }}
              className="text-neutral-400 hover:text-neutral-700"
              aria-label="Cancel"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Field label="Amount (₹)">
              <input
                name="amount"
                type="text"
                inputMode="decimal"
                defaultValue={outstanding > 0 ? outstanding.toFixed(2) : ''}
                required
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-mono tabular-nums text-right focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
              />
            </Field>
            <Field label="Paid on">
              <input
                name="paidOn"
                type="date"
                defaultValue={today}
                required
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
              />
            </Field>
            <Field label="Method">
              <select
                name="method"
                defaultValue="bank_transfer"
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
              >
                <option value="bank_transfer">Bank transfer</option>
                <option value="upi">UPI</option>
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
                <option value="card">Card</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Reference (optional)">
              <input
                name="reference"
                type="text"
                placeholder="UPI / txn / cheque #"
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
              />
            </Field>
          </div>
          <Field label="Notes (optional)">
            <input
              name="notes"
              type="text"
              placeholder="e.g., 20% advance per terms"
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            />
          </Field>
          {error && (
            <p role="alert" className="text-xs text-rose-600">
              {error}
            </p>
          )}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1a2744] px-4 py-2 text-sm font-medium text-white hover:bg-[#0f1829] disabled:opacity-60"
            >
              {pending ? 'Saving…' : 'Save payment'}
            </button>
          </div>
        </form>
      )}

      {/* Payment history */}
      <ul className="divide-y divide-neutral-100">
        {payments.length === 0 && (
          <li className="px-5 py-8 text-center text-sm text-neutral-500">
            No payments recorded yet.
            {outstanding > 0 && ' Click "Record payment" when funds come in.'}
          </li>
        )}
        {payments.map((p) => (
          <li key={p.id} className="flex items-center gap-4 px-5 py-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-mono tabular-nums font-medium text-emerald-700">
                  {inr(p.amount)}
                </span>
                <span className="text-neutral-400">·</span>
                <span className="text-neutral-700">{p.paidOn}</span>
                <span className="text-neutral-400">·</span>
                <span className="text-neutral-500">{METHOD_LABEL[p.method] ?? p.method}</span>
              </div>
              {(p.reference || p.notes) && (
                <div className="text-xs text-neutral-500 mt-0.5 truncate">
                  {[p.reference, p.notes].filter(Boolean).join(' · ')}
                </div>
              )}
            </div>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  if (!confirm(`Delete this ₹${p.amount} payment? This cannot be undone.`)) return;
                  await deletePaymentAction(invoiceId, p.id);
                  router.refresh();
                })
              }
              className="inline-flex items-center justify-center size-8 rounded-lg text-rose-600 hover:bg-rose-50 disabled:opacity-50"
              aria-label="Delete payment"
            >
              <Trash2 className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-medium text-neutral-600 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}
