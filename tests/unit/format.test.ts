import { describe, it, expect } from 'vitest';
import { inr, fmtDate } from '@/server/pdf/format';

describe('inr', () => {
  it('formats whole rupees WITHOUT trailing ".00"', () => {
    expect(inr(20000)).toBe('₹20,000');
  });

  it('shows paise only when present', () => {
    expect(inr(20000.5)).toBe('₹20,000.50');
  });

  it('formats lakhs with Indian grouping', () => {
    expect(inr(123456.5)).toBe('₹1,23,456.50');
  });

  it('handles zero as a clean ₹0', () => {
    expect(inr(0)).toBe('₹0');
  });

  it('accepts numeric strings, drops trailing zeros', () => {
    expect(inr('1500.00')).toBe('₹1,500');
    expect(inr('1500.50')).toBe('₹1,500.50');
  });
});

describe('fmtDate', () => {
  it('formats an ISO date as Month DD, YYYY', () => {
    expect(fmtDate('2026-05-14')).toBe('May 14, 2026');
  });
});
