import { notFound } from 'next/navigation';
import { getQuote } from '@/server/actions/quotes';
import { listCustomers } from '@/server/actions/customers';
import { QuoteFormClient } from '@/components/admin/quote-form-client';

export const dynamic = 'force-dynamic';

export default async function EditQuotePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const [q, customers] = await Promise.all([getQuote(id), listCustomers()]);
  if (!q) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit quote {q.number}</h1>
      <QuoteFormClient
        customers={customers}
        quoteId={q.id}
        initial={{
          customerId: q.customerId,
          title: q.title,
          issueDate: q.issueDate,
          validUntilOrDueDate: q.validUntil,
          gstPercent: q.gstPercent,
          terms: q.terms,
          notes: q.notes,
          items: q.items.map((it) => ({
            description: it.description,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
          })),
        }}
      />
    </div>
  );
}
