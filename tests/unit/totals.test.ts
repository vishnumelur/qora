import { describe, it, expect } from 'vitest';
import {
  lineSubtotal,
  recordTotals,
  recordTotalsWithPayments,
  deriveInvoiceStatus,
  sumPayments,
} from '@/server/domain/totals';

describe('lineSubtotal', () => {
  it('multiplies quantity by unit price', () => {
    expect(lineSubtotal('2', '500.00')).toBe(1000);
  });
  it('handles fractional quantities', () => {
    expect(lineSubtotal('1.5', '100.00')).toBe(150);
  });
  it('handles zero', () => {
    expect(lineSubtotal('0', '100')).toBe(0);
  });
});

describe('recordTotals', () => {
  it('sums line subtotals and applies GST', () => {
    const items = [
      { quantity: '1', unitPrice: '20000.00' },
      { quantity: '2', unitPrice: '500.00' },
    ];
    const t = recordTotals(items, '18.00');
    expect(t.subtotal).toBe(21000);
    expect(t.gstAmount).toBe(3780);
    expect(t.total).toBe(24780);
  });

  it('returns zeros for empty items', () => {
    const t = recordTotals([], '18.00');
    expect(t.subtotal).toBe(0);
    expect(t.gstAmount).toBe(0);
    expect(t.total).toBe(0);
  });

  it('handles 0% GST (e.g., exports)', () => {
    const t = recordTotals([{ quantity: '1', unitPrice: '1000' }], '0');
    expect(t.gstAmount).toBe(0);
    expect(t.total).toBe(1000);
  });
});

describe('sumPayments', () => {
  it('sums string amounts', () => {
    expect(sumPayments([{ amount: '4720.00' }, { amount: '18880.00' }])).toBe(23600);
  });
  it('zero for empty list', () => {
    expect(sumPayments([])).toBe(0);
  });
});

describe('recordTotalsWithPayments', () => {
  const items = [{ quantity: '1', unitPrice: '20000.00' }];
  it('returns full picture for no payments', () => {
    const r = recordTotalsWithPayments(items, '18.00', []);
    expect(r.total).toBe(23600);
    expect(r.paid).toBe(0);
    expect(r.outstanding).toBe(23600);
  });
  it('reflects a partial advance', () => {
    const r = recordTotalsWithPayments(items, '18.00', [{ amount: '4720.00' }]);
    expect(r.paid).toBe(4720);
    expect(r.outstanding).toBe(18880);
  });
  it('outstanding goes negative on overpayment', () => {
    const r = recordTotalsWithPayments(items, '18.00', [{ amount: '25000' }]);
    expect(r.outstanding).toBe(-1400);
  });
});

describe('deriveInvoiceStatus', () => {
  it('keeps draft regardless of payments', () => {
    expect(deriveInvoiceStatus('draft', 1000, 500)).toBe('draft');
  });
  it('paid when sum covers total', () => {
    expect(deriveInvoiceStatus('sent', 1000, 1000)).toBe('paid');
    expect(deriveInvoiceStatus('sent', 1000, 1500)).toBe('paid');
  });
  it('partial when something paid but not all', () => {
    expect(deriveInvoiceStatus('sent', 1000, 250)).toBe('partial');
  });
  it('sent when no payments', () => {
    expect(deriveInvoiceStatus('sent', 1000, 0)).toBe('sent');
  });
});
