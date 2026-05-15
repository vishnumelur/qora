// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const push = vi.fn();
const refresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh }),
}));

const createCustomerAction = vi.fn();
const updateCustomerAction = vi.fn();
const deleteCustomerAction = vi.fn();

vi.mock('@/server/actions/customers', () => ({
  createCustomerAction: (...a: unknown[]) => createCustomerAction(...a),
  updateCustomerAction: (...a: unknown[]) => updateCustomerAction(...a),
  deleteCustomerAction: (...a: unknown[]) => deleteCustomerAction(...a),
}));

import { CustomerForm } from '@/components/admin/customer-form';
import type { Customer } from '@/server/db/schema';

const existingCustomer: Customer = {
  id: 'cust-77',
  name: 'Old Name Pvt Ltd',
  attention: null,
  addressLine: null,
  gstNumber: null,
  email: null,
  phone: null,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('CustomerForm — post-create navigation', () => {
  beforeEach(() => {
    push.mockClear();
    refresh.mockClear();
    createCustomerAction.mockReset();
    updateCustomerAction.mockReset();
  });

  it('navigates to the customers list after creating, not the edit/detail page', async () => {
    createCustomerAction.mockResolvedValue({ ok: true, data: { id: 'cust-123' } });

    const { container } = render(<CustomerForm />);
    const nameInput = container.querySelector('input[name="name"]') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Acme Pvt Ltd' } });

    fireEvent.click(screen.getByRole('button', { name: /create customer/i }));

    await waitFor(() => expect(createCustomerAction).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(push).toHaveBeenCalled());

    // The new customer must be visible in "all customers" right away.
    expect(push).toHaveBeenCalledWith('/admin/customers');
    expect(push).not.toHaveBeenCalledWith('/admin/customers/cust-123');
  });

  it('navigates to the customers list after editing an existing customer', async () => {
    updateCustomerAction.mockResolvedValue({ ok: true, data: undefined });

    const { container } = render(<CustomerForm customer={existingCustomer} />);
    const nameInput = container.querySelector('input[name="name"]') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'New Name Pvt Ltd' } });

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => expect(updateCustomerAction).toHaveBeenCalledTimes(1));
    expect(updateCustomerAction.mock.calls[0][0]).toBe('cust-77');

    // After saving an edit the user must get clear feedback by landing
    // back on the list (no longer stuck silently on the form).
    await waitFor(() => expect(push).toHaveBeenCalledWith('/admin/customers'));
    expect(createCustomerAction).not.toHaveBeenCalled();
  });
});
