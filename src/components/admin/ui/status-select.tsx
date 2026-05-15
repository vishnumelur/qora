'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setQuoteStatusAction } from '@/server/actions/quotes';
import { setInvoiceStatusAction } from '@/server/actions/invoices';
import { statusChip } from './status-colors';
import { cn } from '@/lib/utils';

type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected';
type InvoiceStatus = 'draft' | 'sent' | 'paid';

const QUOTE_OPTIONS: { value: QuoteStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
];

const INVOICE_OPTIONS: { value: InvoiceStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'paid', label: 'Paid' },
];

/**
 * Inline status changer for the quote / invoice list rows. Calls the same
 * server actions the detail-page dropdowns use, then refreshes. The control
 * is colour-coded by its current status (same palette as StatusBadge) so the
 * status is eye-catching at a glance and the colour flips instantly on change.
 */
export function StatusSelect({
  kind,
  id,
  status,
}: {
  kind: 'quote' | 'invoice';
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [value, setValue] = useState(status);
  const options = kind === 'quote' ? QUOTE_OPTIONS : INVOICE_OPTIONS;

  return (
    <select
      key={status}
      value={value}
      disabled={pending}
      aria-label={`Change ${kind} status`}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        const next = e.target.value;
        setValue(next);
        start(async () => {
          if (kind === 'quote') {
            await setQuoteStatusAction(id, next as QuoteStatus);
          } else {
            await setInvoiceStatusAction(id, next as InvoiceStatus);
          }
          router.refresh();
        });
      }}
      className={cn(
        'rounded-lg px-2 py-1 text-xs font-medium capitalize shadow-sm cursor-pointer ring-1 ring-inset',
        'focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50',
        statusChip(value),
      )}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
