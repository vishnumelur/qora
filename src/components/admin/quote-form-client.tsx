'use client';

import { DocumentForm, type DocumentInitial } from './document-form';
import type { Customer } from '@/server/db/schema';
import { createQuoteAction, updateQuoteAction } from '@/server/actions/quotes';

export function QuoteFormClient({
  customers,
  initial,
  quoteId,
}: {
  customers: Customer[];
  initial?: DocumentInitial;
  quoteId?: string;
}) {
  return (
    <DocumentForm
      kind="quote"
      customers={customers}
      initial={initial}
      submitLabel={quoteId ? 'Save changes' : 'Create quote'}
      onSubmit={async (v) => {
        const payload = {
          customerId: v.customerId,
          title: v.title,
          issueDate: v.issueDate,
          validUntil: v.secondDate ?? v.issueDate,
          gstPercent: v.gstPercent,
          terms: v.terms,
          notes: v.notes,
          items: v.items,
        };
        if (quoteId) {
          const res = await updateQuoteAction(quoteId, payload);
          if (!res.ok) return { ok: false, error: res.error, fieldErrors: res.fieldErrors };
          return { ok: true, redirectTo: `/admin/quotes/${quoteId}` };
        }
        const res = await createQuoteAction(payload);
        if (!res.ok) return { ok: false, error: res.error, fieldErrors: res.fieldErrors };
        return { ok: true, redirectTo: `/admin/quotes/${res.data.id}` };
      }}
    />
  );
}
