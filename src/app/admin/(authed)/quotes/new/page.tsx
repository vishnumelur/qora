import { listCustomers } from '@/server/actions/customers';
import { QuoteFormClient } from '@/components/admin/quote-form-client';

export const dynamic = 'force-dynamic';

export default async function NewQuotePage() {
  const customers = await listCustomers();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New quote</h1>
      {customers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-neutral-700">
            You need at least one customer before creating a quote.{' '}
            <a href="/admin/customers/new" className="text-primary underline">
              Create a customer
            </a>{' '}
            first.
          </p>
        </div>
      ) : (
        <QuoteFormClient customers={customers} />
      )}
    </div>
  );
}
