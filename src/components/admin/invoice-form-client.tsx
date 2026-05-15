'use client';

import { DocumentForm, type DocumentInitial } from './document-form';
import type { Customer } from '@/server/db/schema';
import { createInvoiceAction, updateInvoiceAction } from '@/server/actions/invoices';

export function InvoiceFormClient({
  customers,
  initial,
  invoiceId,
}: {
  customers: Customer[];
  initial?: DocumentInitial;
  invoiceId?: string;
}) {
  return (
    <DocumentForm
      kind="invoice"
      customers={customers}
      initial={initial}
      submitLabel={invoiceId ? 'Save changes' : 'Create invoice'}
      onSubmit={async (v) => {
        const payload = {
          customerId: v.customerId,
          title: v.title,
          issueDate: v.issueDate,
          dueDate: v.secondDate,
          gstPercent: v.gstPercent,
          terms: v.terms,
          notes: v.notes,
          items: v.items,
        };
        if (invoiceId) {
          const res = await updateInvoiceAction(invoiceId, payload);
          if (!res.ok) return { ok: false, error: res.error, fieldErrors: res.fieldErrors };
          return { ok: true, redirectTo: `/admin/invoices/${invoiceId}` };
        }
        const res = await createInvoiceAction(payload);
        if (!res.ok) return { ok: false, error: res.error, fieldErrors: res.fieldErrors };
        return { ok: true, redirectTo: `/admin/invoices/${res.data.id}` };
      }}
    />
  );
}
