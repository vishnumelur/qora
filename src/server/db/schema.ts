import {
  pgTable,
  uuid,
  text,
  integer,
  date,
  timestamp,
  numeric,
  primaryKey,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';

// ---------- customers ----------
export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  attention: text('attention'),
  addressLine: text('address_line'),
  gstNumber: text('gst_number'),
  email: text('email'),
  phone: text('phone'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ---------- quotes ----------
// converted_invoice_id references invoices(id); we use an AnyPgColumn callback
// to break the declaration cycle between quotes and invoices.
export const quotes = pgTable('quotes', {
  id: uuid('id').primaryKey().defaultRandom(),
  number: text('number').notNull().unique(),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  title: text('title').notNull(),
  issueDate: date('issue_date').notNull(),
  validUntil: date('valid_until').notNull(),
  gstPercent: numeric('gst_percent', { precision: 5, scale: 2 }).notNull().default('18.00'),
  terms: text('terms').notNull(),
  notes: text('notes'),
  status: text('status').notNull().default('draft'),
  convertedInvoiceId: uuid('converted_invoice_id').references(
    (): AnyPgColumn => invoices.id,
    { onDelete: 'set null' },
  ),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ---------- quote_items ----------
export const quoteItems = pgTable('quote_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  quoteId: uuid('quote_id').notNull().references(() => quotes.id, { onDelete: 'cascade' }),
  position: integer('position').notNull(),
  description: text('description').notNull(),
  quantity: numeric('quantity', { precision: 12, scale: 2 }).notNull(),
  unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
});

// ---------- invoices ----------
export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  number: text('number').notNull().unique(),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  title: text('title').notNull(),
  issueDate: date('issue_date').notNull(),
  dueDate: date('due_date'),
  gstPercent: numeric('gst_percent', { precision: 5, scale: 2 }).notNull().default('18.00'),
  terms: text('terms').notNull(),
  notes: text('notes'),
  status: text('status').notNull().default('draft'),
  paidOn: date('paid_on'),
  sourceQuoteId: uuid('source_quote_id').references(() => quotes.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ---------- invoice_items ----------
export const invoiceItems = pgTable('invoice_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  position: integer('position').notNull(),
  description: text('description').notNull(),
  quantity: numeric('quantity', { precision: 12, scale: 2 }).notNull(),
  unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
});

// ---------- payments (one row per real payment event against an invoice) ----------
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceId: uuid('invoice_id')
    .notNull()
    .references(() => invoices.id, { onDelete: 'cascade' }),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  paidOn: date('paid_on').notNull(),
  // 'bank_transfer' | 'upi' | 'cash' | 'cheque' | 'card' | 'other'
  method: text('method').notNull().default('bank_transfer'),
  reference: text('reference'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ---------- counters (per-year sequence numbers) ----------
export const counters = pgTable(
  'counters',
  {
    kind: text('kind').notNull(),
    year: integer('year').notNull(),
    nextValue: integer('next_value').notNull().default(1),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.kind, t.year] }),
  }),
);

// ---------- type exports ----------
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type Quote = typeof quotes.$inferSelect;
export type NewQuote = typeof quotes.$inferInsert;
export type QuoteItem = typeof quoteItems.$inferSelect;
export type NewQuoteItem = typeof quoteItems.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type NewInvoiceItem = typeof invoiceItems.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
