#!/usr/bin/env node
// Wipes the test customer + their quotes (used for one-off Playwright runs).
// Safe to run repeatedly; deletes by attention="Mr. OBLESHA M.G".
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import { and, eq } from 'drizzle-orm';
import * as schema from '../src/server/db/schema.ts';

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

const found = await db
  .select({ id: schema.customers.id })
  .from(schema.customers)
  .where(eq(schema.customers.attention, 'Mr. OBLESHA M.G'));

for (const c of found) {
  // delete their quotes (items cascade), then the customer
  const qs = await db.select({ id: schema.quotes.id }).from(schema.quotes).where(eq(schema.quotes.customerId, c.id));
  for (const q of qs) await db.delete(schema.quotes).where(eq(schema.quotes.id, q.id));
  await db.delete(schema.customers).where(eq(schema.customers.id, c.id));
}

// Reset quote counter for 2026 so subsequent seeds restart at 001.
await db.delete(schema.counters).where(and(eq(schema.counters.kind, 'quote'), eq(schema.counters.year, 2026)));

console.log(`wiped ${found.length} test customer(s) and reset 2026 quote counter`);
await pool.end();
