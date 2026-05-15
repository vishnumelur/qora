#!/usr/bin/env node
// One-off seed: inserts the test customer + quote that mirrors the
// reference PDF, then prints the new quote id to stdout.
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import { sql } from 'drizzle-orm';
import * as schema from '../src/server/db/schema.ts';

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

const STANDARD_TERMS = [
  'Prices quoted are valid for 7 days from the issue date.',
  'Payment terms: 20% advance, remaining upon delivery.',
  'Delivery Timeline: 10–12 working days from confirmation of purchase order and advance payment.',
  'All customer drawings and technical data will be treated as confidential.',
].join('\n');

const today = new Date().toISOString().slice(0, 10);

const result = await db.transaction(async (tx) => {
  // customer
  const [cust] = await tx
    .insert(schema.customers)
    .values({
      name: 'HCM IBEX ENGINEERING PVT LTD',
      attention: 'Mr. OBLESHA M.G',
      addressLine: 'BANGALORE',
    })
    .returning({ id: schema.customers.id });

  // counter
  const year = Number(today.slice(0, 4));
  const counterRes = await tx
    .insert(schema.counters)
    .values({ kind: 'quote', year, nextValue: 1 })
    .onConflictDoUpdate({
      target: [schema.counters.kind, schema.counters.year],
      set: { nextValue: sql`${schema.counters.nextValue} + 1` },
    })
    .returning({ nextValue: schema.counters.nextValue });
  const n = counterRes[0].nextValue;
  const seq = n < 1000 ? String(n).padStart(3, '0') : String(n);
  const number = `Q-${year}-${seq}`;

  // quote
  const validUntil = new Date(today);
  validUntil.setDate(validUntil.getDate() + 7);
  const validUntilIso = validUntil.toISOString().slice(0, 10);

  const [quote] = await tx
    .insert(schema.quotes)
    .values({
      number,
      customerId: cust.id,
      title: '4+ 4 FAMILY COLD RUNNER INJECTION MOULD DESIGN',
      issueDate: today,
      validUntil: validUntilIso,
      gstPercent: '18.00',
      terms: STANDARD_TERMS,
      status: 'draft',
    })
    .returning({ id: schema.quotes.id, number: schema.quotes.number });

  await tx.insert(schema.quoteItems).values({
    quoteId: quote.id,
    position: 0,
    description: '3D MOULD DESIGN',
    quantity: '1',
    unitPrice: '20000.00',
  });

  return quote;
});

process.stdout.write(`${result.id}\n${result.number}\n`);
await pool.end();
