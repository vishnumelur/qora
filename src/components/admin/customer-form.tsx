'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Customer } from '@/server/db/schema';
import {
  createCustomerAction,
  updateCustomerAction,
  deleteCustomerAction,
} from '@/server/actions/customers';
import { cn } from '@/lib/utils';

type Props = {
  customer?: Customer;
};

const SALUTATIONS = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.'] as const;

function parseAttention(s: string | null | undefined): { salutation: string; name: string } {
  if (!s) return { salutation: '', name: '' };
  for (const p of SALUTATIONS) {
    if (s === p) return { salutation: p, name: '' };
    if (s.startsWith(p + ' ')) return { salutation: p, name: s.slice(p.length + 1) };
  }
  return { salutation: '', name: s };
}

export function CustomerForm({ customer }: Props) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const initial = useMemo(() => parseAttention(customer?.attention ?? ''), [customer?.attention]);
  const [salutation, setSalutation] = useState<string>(initial.salutation);
  const [contactName, setContactName] = useState<string>(initial.name);

  const combinedAttention = [salutation, contactName].filter(Boolean).join(' ').trim();

  const isEdit = !!customer;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setErrors({});
        setError(null);
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          const res = isEdit
            ? await updateCustomerAction(customer!.id, fd)
            : await createCustomerAction(fd);
          if (!res.ok) {
            setError(res.error);
            setErrors(res.fieldErrors ?? {});
            return;
          }
          // Both create and edit land back on the customers list so the
          // save is unambiguous (no silently staying on the form).
          router.push('/admin/customers');
          router.refresh();
        });
      }}
      className="space-y-5 max-w-xl"
    >
      <Field
        label="Company name"
        name="name"
        defaultValue={customer?.name ?? ''}
        error={errors.name}
        required
      />

      {/* Contact person — salutation dropdown + name in one row */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-neutral-700">Contact person</label>
        <div className="flex gap-2">
          <select
            value={salutation}
            onChange={(e) => setSalutation(e.target.value)}
            className="w-24 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500"
          >
            <option value="">—</option>
            {SALUTATIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className={cn(
              'flex-1 rounded-xl border bg-white px-4 py-2.5 text-sm placeholder:text-neutral-400 shadow-sm',
              'focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500',
              errors.attention ? 'border-rose-400' : 'border-neutral-200',
            )}
            placeholder="Vishnu Manoj"
          />
        </div>
        {/* Hidden mirrored field for the action — preserves the combined value */}
        <input type="hidden" name="attention" value={combinedAttention} />
        {errors.attention && <p className="text-xs text-rose-600">{errors.attention}</p>}
      </div>

      <Field
        label="Email"
        name="email"
        type="email"
        defaultValue={customer?.email ?? ''}
        error={errors.email}
      />
      <Field
        label="Phone"
        name="phone"
        defaultValue={customer?.phone ?? ''}
        error={errors.phone}
      />
      <Field
        label="Address"
        name="addressLine"
        defaultValue={customer?.addressLine ?? ''}
        error={errors.addressLine}
      />
      <Field
        label="GST number"
        name="gstNumber"
        defaultValue={customer?.gstNumber ?? ''}
        error={errors.gstNumber}
      />

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-neutral-700">Notes</label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={customer?.notes ?? ''}
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm placeholder:text-neutral-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-shadow"
        />
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl bg-rose-50 ring-1 ring-rose-200 px-4 py-2.5 text-sm text-rose-700"
        >
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1a2744] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#0f1829] hover:shadow-md disabled:opacity-60"
        >
          {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Create customer'}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={() => {
              setErrors({});
              setError(null);
              if (!confirm('Delete this customer? This cannot be undone.')) return;
              startTransition(async () => {
                const res = await deleteCustomerAction(customer!.id);
                if (!res.ok) {
                  setError(res.error);
                  return;
                }
                router.push('/admin/customers');
              });
            }}
            disabled={pending}
            className="ml-auto text-sm text-rose-600 hover:underline disabled:opacity-50"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  error,
  type = 'text',
  placeholder,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  error?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-neutral-700">
        {label}
        {required && <span className="text-rose-600 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className={cn(
          'w-full rounded-xl border bg-white px-4 py-2.5 text-sm placeholder:text-neutral-400',
          'focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500',
          'shadow-sm transition-shadow',
          error ? 'border-rose-400' : 'border-neutral-200',
        )}
      />
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
