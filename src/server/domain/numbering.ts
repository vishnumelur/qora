import 'server-only';
import { sql } from 'drizzle-orm';
import { counters } from '@/server/db/schema';
import type { db } from '@/server/db/client';

export type RecordKind = 'quote' | 'invoice';

const PREFIX: Record<RecordKind, string> = {
  quote: 'Q',
  invoice: 'INV',
};

export function formatRecordNumber(kind: RecordKind, year: number, n: number): string {
  const seq = n < 1000 ? String(n).padStart(3, '0') : String(n);
  return `${PREFIX[kind]}-${year}-${seq}`;
}

type TxLike = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Allocate the next number for the given (kind, year) within a transaction.
 * Returns the formatted string, e.g. "Q-2026-007".
 *
 * Must be called inside a `db.transaction(...)` block so the upsert is
 * race-safe against concurrent inserts.
 */
export async function allocateNumber(
  tx: TxLike,
  kind: RecordKind,
  year: number,
): Promise<string> {
  const result = await tx
    .insert(counters)
    .values({ kind, year, nextValue: 1 })
    .onConflictDoUpdate({
      target: [counters.kind, counters.year],
      set: { nextValue: sql`${counters.nextValue} + 1` },
    })
    .returning({ nextValue: counters.nextValue });

  // When the row is newly inserted, returned nextValue is 1 (the seed).
  // When it pre-existed, returned nextValue is the post-increment value.
  // Both cases yield the correct "current" number for this allocation.
  const n = result[0].nextValue;
  return formatRecordNumber(kind, year, n);
}
