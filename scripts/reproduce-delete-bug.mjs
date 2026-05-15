#!/usr/bin/env node
// Reproduces the quote/invoice/customer delete bugs against a real Postgres
// connection, wrapped in a transaction that ROLLS BACK at the end so no
// production data is touched.
//
// Run: node --env-file=.env.local --experimental-strip-types scripts/reproduce-delete-bug.mjs
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import { eq } from 'drizzle-orm';
import * as schema from '../src/server/db/schema.ts';

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

function header(s) { console.log('\n=== ' + s + ' ==='); }
function ok(s) { console.log('  ✅ ' + s); }
function bad(s, e) { console.log('  ❌ ' + s + ' — ' + e.message.split('\n')[0]); }

const TEST_YEAR = 1899;

await db.transaction(async (tx) => {
  // --- SEED ---
  header('Seeding fixtures');
  const [cust] = await tx.insert(schema.customers).values({
    name: 'DELETE_BUG_TEST_CUSTOMER',
  }).returning();
  ok('customer ' + cust.id.slice(0, 8));

  await tx.insert(schema.counters).values({ kind: 'quote', year: TEST_YEAR, nextValue: 1 }).onConflictDoNothing();
  await tx.insert(schema.counters).values({ kind: 'invoice', year: TEST_YEAR, nextValue: 1 }).onConflictDoNothing();

  const [unconvertedQuote] = await tx.insert(schema.quotes).values({
    number: `Q-${TEST_YEAR}-A`,
    customerId: cust.id,
    title: 'unconverted test',
    issueDate: `${TEST_YEAR}-01-01`,
    validUntil: `${TEST_YEAR}-01-08`,
    terms: 'test terms',
  }).returning();
  ok('quote A (unconverted) ' + unconvertedQuote.id.slice(0, 8));

  const [convertedQuote] = await tx.insert(schema.quotes).values({
    number: `Q-${TEST_YEAR}-B`,
    customerId: cust.id,
    title: 'converted test',
    issueDate: `${TEST_YEAR}-01-01`,
    validUntil: `${TEST_YEAR}-01-08`,
    terms: 'test terms',
  }).returning();
  ok('quote B (will be converted) ' + convertedQuote.id.slice(0, 8));

  const [invoice] = await tx.insert(schema.invoices).values({
    number: `INV-${TEST_YEAR}-A`,
    customerId: cust.id,
    title: 'invoice from quote B',
    issueDate: `${TEST_YEAR}-01-01`,
    terms: 'test terms',
    sourceQuoteId: convertedQuote.id,
  }).returning();
  ok('invoice from quote B ' + invoice.id.slice(0, 8));

  await tx.update(schema.quotes)
    .set({ convertedInvoiceId: invoice.id })
    .where(eq(schema.quotes.id, convertedQuote.id));
  ok('linked quote B ↔ invoice');

  // --- TEST 1: delete unconverted quote — SHOULD SUCCEED ---
  header('Test 1: Delete UNCONVERTED quote A');
  try {
    // Use a savepoint so the failure doesn't kill the outer transaction
    await tx.transaction(async (sp) => {
      await sp.delete(schema.quotes).where(eq(schema.quotes.id, unconvertedQuote.id));
    });
    ok('unconverted quote deleted cleanly (as expected)');
  } catch (e) {
    bad('unconverted quote delete FAILED (unexpected)', e);
  }

  // --- TEST 2: delete CONVERTED quote — POST-FIX: should succeed, leave invoice with source_quote_id = NULL ---
  header('Test 2: Delete CONVERTED quote B (POST-FIX: should succeed; invoice survives with NULL source)');
  try {
    await tx.transaction(async (sp) => {
      await sp.delete(schema.quotes).where(eq(schema.quotes.id, convertedQuote.id));
    });
    ok('quote deleted');
    const [inv] = await tx
      .select({ src: schema.invoices.sourceQuoteId })
      .from(schema.invoices)
      .where(eq(schema.invoices.id, invoice.id));
    if (inv && inv.src === null) ok('invoice.source_quote_id is now NULL (orphaned safely)');
    else bad('invoice.source_quote_id was NOT nulled', { message: String(inv?.src) });
  } catch (e) {
    bad('quote delete FAILED (post-fix should succeed)', e);
  }

  // --- TEST 3: delete invoice — POST-FIX: should succeed (no quotes link back since we deleted that quote) ---
  // Re-link: create a new quote and convert it again to test invoice-side null
  const [q3] = await tx.insert(schema.quotes).values({
    number: `Q-${TEST_YEAR}-C`,
    customerId: cust.id,
    title: 'fresh quote',
    issueDate: `${TEST_YEAR}-01-01`,
    validUntil: `${TEST_YEAR}-01-08`,
    terms: 't',
  }).returning();
  const [inv3] = await tx.insert(schema.invoices).values({
    number: `INV-${TEST_YEAR}-B`,
    customerId: cust.id,
    title: 'inv from C',
    issueDate: `${TEST_YEAR}-01-01`,
    terms: 't',
    sourceQuoteId: q3.id,
  }).returning();
  await tx.update(schema.quotes)
    .set({ convertedInvoiceId: inv3.id })
    .where(eq(schema.quotes.id, q3.id));

  header('Test 3: Delete invoice (POST-FIX: should succeed; quote.converted_invoice_id becomes NULL)');
  try {
    await tx.transaction(async (sp) => {
      await sp.delete(schema.invoices).where(eq(schema.invoices.id, inv3.id));
    });
    ok('invoice deleted');
    const [q] = await tx
      .select({ ci: schema.quotes.convertedInvoiceId })
      .from(schema.quotes)
      .where(eq(schema.quotes.id, q3.id));
    if (q && q.ci === null) ok('quote.converted_invoice_id is now NULL');
    else bad('quote.converted_invoice_id was NOT nulled', { message: String(q?.ci) });
  } catch (e) {
    bad('invoice delete FAILED (post-fix should succeed)', e);
  }

  // --- TEST 4: delete customer with quote/invoice — EXPECTED TO FAIL ---
  header('Test 4: Delete customer with quotes/invoices (HYPOTHESIS: should fail)');
  try {
    await tx.transaction(async (sp) => {
      await sp.delete(schema.customers).where(eq(schema.customers.id, cust.id));
    });
    bad('customer was deleted — hypothesis WRONG', { message: 'no error thrown' });
  } catch (e) {
    ok('FK violation caught: "' + e.message.split('\n')[0] + '"');
  }

  // ROLLBACK — fail the outer transaction intentionally to clean up.
  throw new Error('ROLLBACK_INTENTIONAL_CLEANUP');
}).catch((e) => {
  if (e.message === 'ROLLBACK_INTENTIONAL_CLEANUP') {
    console.log('\n=== CLEANUP ===\n  ✅ Rolled back — no data persisted on prod');
  } else {
    console.error('Unexpected outer error:', e);
    process.exit(2);
  }
});

await pool.end();
