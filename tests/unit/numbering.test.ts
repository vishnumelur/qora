import { describe, it, expect } from 'vitest';
import { formatRecordNumber } from '@/server/domain/numbering';

describe('formatRecordNumber', () => {
  it('formats quote numbers with zero-padded sequence', () => {
    expect(formatRecordNumber('quote', 2026, 1)).toBe('Q-2026-001');
    expect(formatRecordNumber('quote', 2026, 42)).toBe('Q-2026-042');
  });

  it('formats invoice numbers with INV prefix', () => {
    expect(formatRecordNumber('invoice', 2026, 1)).toBe('INV-2026-001');
  });

  it('expands to 4+ digits past 999', () => {
    expect(formatRecordNumber('quote', 2026, 1000)).toBe('Q-2026-1000');
    expect(formatRecordNumber('quote', 2026, 9999)).toBe('Q-2026-9999');
  });
});
