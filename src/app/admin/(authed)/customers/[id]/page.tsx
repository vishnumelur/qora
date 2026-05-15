import { notFound } from 'next/navigation';
import { getCustomer } from '@/server/actions/customers';
import { CustomerForm } from '@/components/admin/customer-form';

export const dynamic = 'force-dynamic';

export default async function EditCustomerPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const c = await getCustomer(id);
  if (!c) notFound();
  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-semibold">Edit customer</h1>
      <CustomerForm customer={c} />
    </div>
  );
}
