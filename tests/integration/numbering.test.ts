import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/server/db/client';
import { counters } from '@/server/db/schema';
import { allocateNumber } from '@/server/domain/numbering';
import { eq, and } from 'drizzle-orm';

const TEST_YEAR = 1900; // unlikely to collide with real data

describe('allocateNumber (integration)', () => {
  beforeAll(async () => {
    await db.delete(counters).where(and(eq(counters.kind, 'quote'), eq(counters.year, TEST_YEAR)));
  });

  afterAll(async () => {
    await db.delete(counters).where(and(eq(counters.kind, 'quote'), eq(counters.year, TEST_YEAR)));
  });

  it('returns Q-1900-001 on first allocation', async () => {
    const n = await db.transaction((tx) => allocateNumber(tx, 'quote', TEST_YEAR));
    expect(n).toBe('Q-1900-001');
  });

  it('returns sequential numbers', async () => {
    const a = await db.transaction((tx) => allocateNumber(tx, 'quote', TEST_YEAR));
    const b = await db.transaction((tx) => allocateNumber(tx, 'quote', TEST_YEAR));
    const aNum = Number(a.split('-')[2]);
    const bNum = Number(b.split('-')[2]);
    expect(bNum).toBe(aNum + 1);
  });

  it('survives 10 concurrent allocations without collision', async () => {
    const promises = Array.from({ length: 10 }, () =>
      db.transaction((tx) => allocateNumber(tx, 'quote', TEST_YEAR)),
    );
    const results = await Promise.all(promises);
    const unique = new Set(results);
    expect(unique.size).toBe(10);
  });
});
