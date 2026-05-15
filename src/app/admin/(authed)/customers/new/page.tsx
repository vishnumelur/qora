import { CustomerForm } from '@/components/admin/customer-form';

export default function NewCustomerPage() {
  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-semibold">New customer</h1>
      <CustomerForm />
    </div>
  );
}
