import { describe, it, expect } from 'vitest';
import { customerSchema } from '@/server/validation/customer';
import { quoteCreateSchema } from '@/server/validation/quote';
import { invoiceCreateSchema } from '@/server/validation/invoice';

describe('customerSchema', () => {
  it('accepts a minimal valid customer', () => {
    const r = customerSchema.safeParse({ name: 'Acme' });
    expect(r.success).toBe(true);
  });
  it('rejects empty name', () => {
    const r = customerSchema.safeParse({ name: '' });
    expect(r.success).toBe(false);
  });
});

describe('quoteCreateSchema', () => {
  const valid = {
    customerId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    title: '4+4 Family Mould Design',
    issueDate: '2026-05-14',
    validUntil: '2026-05-21',
    gstPercent: '18.00',
    terms: 'Terms…',
    items: [{ description: '3D Mould Design', quantity: '1', unitPrice: '20000.00' }],
  };

  it('accepts a valid quote', () => {
    expect(quoteCreateSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects an empty items array', () => {
    const r = quoteCreateSchema.safeParse({ ...valid, items: [] });
    expect(r.success).toBe(false);
  });

  it('rejects validUntil before issueDate', () => {
    const r = quoteCreateSchema.safeParse({ ...valid, validUntil: '2026-05-13' });
    expect(r.success).toBe(false);
  });

  it('rejects quantity <= 0', () => {
    const bad = { ...valid, items: [{ description: 'x', quantity: '0', unitPrice: '1' }] };
    expect(quoteCreateSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects gstPercent out of [0,100]', () => {
    const r = quoteCreateSchema.safeParse({ ...valid, gstPercent: '120.00' });
    expect(r.success).toBe(false);
  });
});

describe('invoiceCreateSchema', () => {
  const valid = {
    customerId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    title: 'Mould Design Invoice',
    issueDate: '2026-05-14',
    dueDate: '2026-05-28',
    gstPercent: '18.00',
    terms: 'Terms…',
    items: [{ description: '3D Mould Design', quantity: '1', unitPrice: '20000.00' }],
  };

  it('accepts a valid invoice', () => {
    expect(invoiceCreateSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts a null due date', () => {
    expect(invoiceCreateSchema.safeParse({ ...valid, dueDate: null }).success).toBe(true);
  });

  it('rejects dueDate before issueDate', () => {
    expect(
      invoiceCreateSchema.safeParse({ ...valid, dueDate: '2026-05-13' }).success,
    ).toBe(false);
  });
});
