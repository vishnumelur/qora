'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LineItemsEditor, type LineItemRow } from './line-items-editor';
import { CustomerCombobox } from './ui/customer-combobox';
import { recordTotals } from '@/server/domain/totals';
import { inr } from '@/server/pdf/format';
import type { Customer } from '@/server/db/schema';
import { STANDARD_TERMS } from '@/server/pdf/constants';

type Kind = 'quote' | 'invoice';

export type DocumentInitial = {
  customerId?: string;
  title?: string;
  issueDate?: string;
  validUntilOrDueDate?: string | null;
  gstPercent?: string;
  terms?: string;
  notes?: string | null;
  items?: LineItemRow[];
};

export type DocumentFormSubmit = (input: {
  customerId: string;
  title: string;
  issueDate: string;
  secondDate: string | null;
  gstPercent: string;
  terms: string;
  notes: string;
  items: LineItemRow[];
}) => Promise<
  | { ok: true; redirectTo: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> }
>;

type Props = {
  kind: Kind;
  customers: Customer[];
  initial?: DocumentInitial;
  onSubmit: DocumentFormSubmit;
  submitLabel: string;
};

export function DocumentForm({ kind, customers, initial, onSubmit, submitLabel }: Props) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const secondDateDefault = addDaysIso(today, kind === 'quote' ? 7 : 14);

  const [customerId, setCustomerId] = useState(initial?.customerId ?? customers[0]?.id ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [issueDate, setIssueDate] = useState(initial?.issueDate ?? today);
  const [secondDate, setSecondDate] = useState<string | null>(
    initial?.validUntilOrDueDate ?? secondDateDefault,
  );
  const [gstPercent, setGstPercent] = useState(initial?.gstPercent ?? '18.00');
  const [terms, setTerms] = useState(initial?.terms ?? STANDARD_TERMS);
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [items, setItems] = useState<LineItemRow[]>(
    initial?.items?.length ? initial.items : [{ description: '', quantity: '1', unitPrice: '0' }],
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const totals = useMemo(() => recordTotals(items, gstPercent || '0'), [items, gstPercent]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        setErrors({});
        startTransition(async () => {
          const res = await onSubmit({
            customerId,
            title,
            issueDate,
            secondDate: secondDate || null,
            gstPercent,
            terms,
            notes,
            items,
          });
          if (!res.ok) {
            setError(res.error);
            setErrors(res.fieldErrors ?? {});
            return;
          }
          router.push(res.redirectTo);
        });
      }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium mb-1">Customer *</label>
          <CustomerCombobox
            customers={customers}
            value={customerId}
            onChange={setCustomerId}
            error={errors.customerId}
            required
          />
        </div>
        <Field label="Title *" error={errors.title}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 shadow-sm transition-shadow"
            placeholder="e.g., 4+4 FAMILY COLD RUNNER INJECTION MOULD DESIGN"
            required
          />
        </Field>
        <Field label="Issue date *" error={errors.issueDate}>
          <input
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 shadow-sm transition-shadow"
            required
          />
        </Field>
        <Field
          label={kind === 'quote' ? 'Valid until *' : 'Due date'}
          error={kind === 'quote' ? errors.validUntil : errors.dueDate}
        >
          <input
            type="date"
            value={secondDate ?? ''}
            onChange={(e) => setSecondDate(e.target.value || null)}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 shadow-sm transition-shadow"
            required={kind === 'quote'}
          />
        </Field>
        <Field label="GST %" error={errors.gstPercent}>
          <input
            inputMode="decimal"
            value={gstPercent}
            onChange={(e) => setGstPercent(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 shadow-sm transition-shadow"
          />
        </Field>
      </div>

      <div>
        <h2 className="text-sm font-medium text-neutral-700 mb-2">Line items</h2>
        <LineItemsEditor initial={items} onChange={setItems} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-neutral-700">Terms &amp; Conditions</label>
          <button
            type="button"
            onClick={() => setTerms(STANDARD_TERMS)}
            className="text-xs text-cyan-700 hover:text-cyan-900 hover:underline"
          >
            Reset to default
          </button>
        </div>
        <textarea
          value={terms}
          onChange={(e) => setTerms(e.target.value)}
          rows={5}
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-mono placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 shadow-sm transition-shadow"
        />
      </div>

      <Field label="Notes" error={errors.notes}>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 shadow-sm transition-shadow"
        />
      </Field>

      <div className="ml-auto max-w-sm rounded-2xl bg-white ring-1 ring-neutral-200/70 shadow-sm overflow-hidden">
        <div className="px-5 py-3 flex justify-between text-sm">
          <span className="text-neutral-500">Subtotal</span>
          <span className="font-mono tabular-nums">{inr(totals.subtotal)}</span>
        </div>
        <div className="px-5 py-3 border-t border-neutral-100 flex justify-between text-sm">
          <span className="text-neutral-500">GST {gstPercent || '0'}%</span>
          <span className="font-mono tabular-nums">{inr(totals.gstAmount)}</span>
        </div>
        <div className="px-5 py-4 border-t border-neutral-100 bg-[#1a2744] text-white flex justify-between items-baseline">
          <span className="text-sm font-medium">Total</span>
          <span className="font-mono tabular-nums text-xl font-semibold">{inr(totals.total)}</span>
        </div>
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="sticky bottom-0 -mx-4 sm:relative sm:mx-0 bg-neutral-50/95 backdrop-blur-sm border-t border-neutral-200 sm:border-0 sm:bg-transparent px-4 py-3 sm:p-0 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1a2744] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#0f1829] hover:shadow-md disabled:opacity-60"
        >
          {pending ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

function addDaysIso(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}
