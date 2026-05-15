import { notFound } from 'next/navigation';
import { getInvoice } from '@/server/actions/invoices';
import { listCustomers } from '@/server/actions/customers';
import { InvoiceFormClient } from '@/components/admin/invoice-form-client';

export const dynamic = 'force-dynamic';

export default async function EditInvoicePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const [inv, customers] = await Promise.all([getInvoice(id), listCustomers()]);
  if (!inv) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit invoice {inv.number}</h1>
      <InvoiceFormClient
        customers={customers}
        invoiceId={inv.id}
        initial={{
          customerId: inv.customerId,
          title: inv.title,
          issueDate: inv.issueDate,
          validUntilOrDueDate: inv.dueDate,
          gstPercent: inv.gstPercent,
          terms: inv.terms,
          notes: inv.notes,
          items: inv.items.map((it) => ({
            description: it.description,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
          })),
        }}
      />
    </div>
  );
}
