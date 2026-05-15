# Quote & Invoice Maker — Design Spec

**Date:** 2026-05-14
**Author:** Vishnu Manoj (Molvexa)
**Status:** Approved design, ready for implementation planning
**Target site:** https://molvexa.com (Next.js 16 App Router, hosted on Vercel)

---

## 1. Purpose

Replace the current manual workflow of producing Molvexa quotes and invoices in
a desktop tool by adding a small password-protected admin area to the existing
marketing website. The admin can:

- Maintain a reusable list of customers.
- Create, edit, duplicate, and download quotes that visually match the existing
  Molvexa quote PDF (navy header, wavy SVG accents, item table, GST footer,
  signature block).
- Convert an accepted quote into an invoice with one click.
- Mark invoices as Paid and see outstanding amounts at a glance.
- Generate the final PDF on demand.

The marketing site and contact form are unchanged.

## 2. Non-goals

- No multi-user accounts. One shared admin password is enough.
- No customer-facing portal. No public links to quotes/invoices.
- No email delivery of PDFs (download-only).
- No payment integration. "Mark Paid" is a manual click.
- No accounting features (e.g., ledgers, tax filings, P&L).
- No mobile app. The admin pages are responsive web only.
- No multi-currency. INR only. No multi-language. English only.

## 3. Constraints

- Stay on free tiers of every external service for the foreseeable future.
- Keep the marketing-site stack untouched: Next.js 16, React 19, Tailwind 4,
  shadcn-style Radix components, Resend.
- Generated PDFs must visually match the existing Molvexa template
  (reference: `~/Downloads/molvexa quote.pdf`).
- INR currency formatted as `₹20,000.00` (Indian digit grouping).
- GST defaults to 18% but is editable per record.
- Quote/invoice numbers must be globally unique within their kind and year.

## 4. Stack & free-tier accounting

| Concern        | Choice                                | Free tier headroom at expected use |
| -------------- | ------------------------------------- | ---------------------------------- |
| Hosting        | Vercel Hobby (`vishnumelur` account)  | 100 GB bandwidth, 6000 build-min — far exceeds need |
| Database       | Neon Postgres (`hello.molvexa` org)   | 0.5 GB storage, 190 compute-hrs/mo — expected use <50 MB and <5 hrs/mo |
| ORM            | Drizzle ORM + `@neondatabase/serverless` | n/a (open source) |
| PDF engine     | `@react-pdf/renderer`                  | n/a (open source, runs in Vercel Function) |
| Auth           | Custom: shared password + `jose` JWT  | n/a (open source) |
| Email          | Resend (existing, not used for PDFs)  | 100/day, 3000/mo — unchanged |
| Total cost     |                                        | **₹0/month** |

### Account ownership note

The Molvexa Neon project is owned by `hello.molvexa@gmail.com`. The Vercel
project remains under `vishnumelur` for now; Neon credentials are bridged
manually via Vercel env vars rather than via the native Neon Marketplace
integration. This split is acceptable short-term. A future migration story can
re-import the project under the `Vishnu-molvexa` Vercel account; the database
URL is the only thing that would need to be re-provisioned.

## 5. Environment variables

| Name                     | Where set                              | Purpose |
| ------------------------ | -------------------------------------- | ------- |
| `DATABASE_URL`           | Vercel (Prod+Preview+Dev), `.env.local` | Pooled Postgres URL for runtime queries |
| `DATABASE_URL_UNPOOLED`  | Vercel (Prod+Preview+Dev), `.env.local` | Direct Postgres URL for `drizzle-kit` migrations |
| `ADMIN_PASSWORD`         | Vercel (Prod+Preview+Dev), `.env.local` | The single shared admin password (plain text, treat as Sensitive) |
| `ADMIN_SESSION_SECRET`   | Vercel (Prod+Preview+Dev), `.env.local` | 32-byte random string used to sign the session JWT (HS256) |

All four are marked **Sensitive** in Vercel. `.gitignore` already excludes
`.env*`, so secrets never enter git.

## 6. Data model (Postgres / Drizzle)

```text
customers
  id              uuid pk default gen_random_uuid()
  name            text not null         -- "HCM IBEX ENGINEERING PVT LTD"
  attention       text                  -- "Mr. OBLESHA M.G"
  address_line    text                  -- "BANGALORE"
  gst_number      text
  email           text
  phone           text
  notes           text
  created_at      timestamptz not null default now()
  updated_at      timestamptz not null default now()

quotes
  id                    uuid pk default gen_random_uuid()
  number                text not null unique          -- "Q-2026-001"
  customer_id           uuid not null references customers(id)
  title                 text not null                 -- "4+4 FAMILY COLD RUNNER..."
  issue_date            date not null
  valid_until           date not null
  gst_percent           numeric(5,2) not null default 18.00
  terms                 text not null                 -- editable, default = STANDARD_TERMS
  notes                 text
  status                text not null default 'draft' -- 'draft'|'sent'|'accepted'|'rejected'
  converted_invoice_id  uuid references invoices(id)
  created_at            timestamptz not null default now()
  updated_at            timestamptz not null default now()

quote_items
  id              uuid pk default gen_random_uuid()
  quote_id        uuid not null references quotes(id) on delete cascade
  position        int  not null                       -- display order, 0-based
  description     text not null
  quantity        numeric(12,2) not null
  unit_price      numeric(12,2) not null
  -- subtotal is computed in app: quantity * unit_price

invoices
  id              uuid pk default gen_random_uuid()
  number          text not null unique                -- "INV-2026-001"
  customer_id     uuid not null references customers(id)
  title           text not null
  issue_date      date not null
  due_date        date                                -- optional; UI default = issue_date + 14d
  gst_percent     numeric(5,2) not null default 18.00
  terms           text not null
  notes           text
  status          text not null default 'draft'      -- 'draft'|'sent'|'paid'
  paid_on         date
  source_quote_id uuid references quotes(id)
  created_at      timestamptz not null default now()
  updated_at      timestamptz not null default now()

invoice_items
  id              uuid pk default gen_random_uuid()
  invoice_id      uuid not null references invoices(id) on delete cascade
  position        int  not null
  description     text not null
  quantity        numeric(12,2) not null
  unit_price      numeric(12,2) not null

counters
  -- single source of truth for per-year sequence numbers
  kind            text not null                       -- 'quote'|'invoice'
  year            int  not null
  next_value      int  not null default 1
  primary key (kind, year)
```

### Bidirectional FK handling

`quotes.converted_invoice_id` references `invoices(id)`, and
`invoices.source_quote_id` references `quotes(id)`. Because both tables
reference each other, the initial migration creates both tables first **without
these specific FK constraints**, then adds them with `ALTER TABLE` statements
in the same migration file. `drizzle-kit` handles this naturally if both FKs
are declared in `schema.ts`; the generated migration sequences the DDL
correctly.

### Why a `counters` table

`Q-2026-001` numbers must be unique and gap-free. A `SELECT MAX(...) + 1`
pattern races under concurrent inserts. Instead, every create wraps:

```sql
BEGIN;
INSERT INTO counters (kind, year, next_value) VALUES ('quote', 2026, 1)
  ON CONFLICT (kind, year) DO UPDATE SET next_value = counters.next_value + 1
  RETURNING next_value;
-- format as "Q-2026-001"
-- insert into quotes with that number
COMMIT;
```

### Computed values (not stored)

These are derived on read and on PDF render:

- `line_subtotal = quantity * unit_price`
- `record_subtotal = sum(line_subtotal)`
- `gst_amount = record_subtotal * gst_percent / 100`
- `total = record_subtotal + gst_amount`

Storing them invites drift; recomputing is cheap.

### Standard terms (default value)

Lifted directly from the reference PDF:

```
- Prices quoted are valid for 7 days from the issue date.
- Payment terms: 20% advance, remaining upon delivery.
- Delivery Timeline: 10–12 working days from confirmation of purchase order and advance payment.
- All customer drawings and technical data will be treated as confidential.
```

These are inserted into the `terms` column whenever a new quote is created
("default terms" button in the UI also restores them). Editing terms on one
record never affects others.

## 7. Authentication

### Mechanism

Single shared password, signed cookie. No external auth provider, no
NextAuth/Auth.js.

```text
1. User hits any /admin/* or /api/admin/* route.
2. Middleware reads `admin` cookie, verifies JWT signature with
   ADMIN_SESSION_SECRET.
   - Invalid/expired/missing → redirect to /admin/login (or 401 JSON for /api/*).
3. /admin/login renders a single-field password form.
4. POST /api/admin/login compares submitted password with ADMIN_PASSWORD
   using a constant-time compare.
   - Match → sign JWT (payload {sub:'admin'}, exp 30 days), set cookie:
       httpOnly, secure (in prod), sameSite=lax, path=/, maxAge=30d.
     Redirect to /admin.
   - Mismatch → increment rate-limit counter, return 401 + "Wrong password".
5. POST /api/admin/logout → clear cookie, redirect to /admin/login.
```

### Rate limiting

A tiny in-process Map keyed by client IP, holding `{count, resetAt}`. Each
failed login increments; once count ≥ 5 and the window (15 minutes) hasn't
elapsed, return 429 without checking the password. Acceptable because:

- Vercel serverless instances are short-lived, but per-instance state survives
  long enough to slow real attacks meaningfully.
- One admin user, low-traffic endpoint, no compliance requirement for a
  distributed limiter.

If at any point this proves insufficient, we can swap in Vercel KV (now via
Marketplace) without changing the API surface.

### Middleware coverage

`middleware.ts` at the project root matches:

- `/admin/:path*` (all admin pages)
- `/api/admin/:path*` (all admin API routes)

Exempt from the auth check (matched but always allowed through):

- `/admin/login` (the login form itself)
- `/api/admin/login` (the form action)

### Why not NextAuth/Auth.js

NextAuth adds three dependencies and an adapter table just to express
"one password, one user". A 40-line custom handler is clearer, easier to audit,
and removes a third-party trust dependency.

## 8. Routes & UI map

### Pages (App Router)

```
/admin/login                              password form
/admin                                    dashboard
  - recent quotes (5)
  - recent invoices (5)
  - "Outstanding invoices" total (sum of unpaid)
/admin/customers                          list, search by name
/admin/customers/new                      create form
/admin/customers/[id]                     edit; history table of that customer's quotes+invoices
/admin/quotes                             list, filter by status/customer/year, search by number/title
/admin/quotes/new                         create form
/admin/quotes/[id]                        view; actions: Edit, Duplicate, Download PDF,
                                          Convert to Invoice, Mark Sent/Accepted/Rejected
/admin/quotes/[id]/edit                   edit form (same component as /new)
/admin/invoices                           list, filter; "Outstanding" total at top
/admin/invoices/new                       create form (also reached via Convert)
/admin/invoices/[id]                      view; actions: Edit, Duplicate, Download PDF,
                                          Mark Paid (sets paid_on=today)
/admin/invoices/[id]/edit                 edit form
```

### API routes

```
POST   /api/admin/login                   { password } → sets cookie, 302
POST   /api/admin/logout                  clears cookie, 302
GET    /api/admin/quotes/[id]/pdf         streams application/pdf; filename = "Q-2026-001.pdf"
GET    /api/admin/invoices/[id]/pdf       streams application/pdf; filename = "INV-2026-001.pdf"
```

All CRUD on customers/quotes/invoices is handled by **Server Actions**
co-located with the page that uses them (no separate REST API). This keeps
the surface area small and avoids a duplicated validation layer.

### Form component reuse

`<QuoteForm>` and `<InvoiceForm>` share an internal `<DocumentForm>`. They
differ only in:

- Title of the page
- Status enum shown
- "Valid until" (quote) vs "Due date" (invoice)
- Whether the "Convert to Invoice" button appears

Line-items editor is a single `<LineItemsEditor>` component used by both:
add row, remove row, drag-reorder (`position`), inline edit
description/quantity/unit_price, live subtotal/GST/total preview at the
bottom.

## 9. PDF generator

### Engine

`@react-pdf/renderer`. The PDF runs in a Vercel Function (Node.js runtime,
not edge — needed because `@react-pdf/renderer` uses some Node-specific APIs
like font registration with the filesystem).

### Layout (per the reference PDF)

```
┌──────────────────────────────────────────────────────────────┐
│ ─── thin navy line ───────────       ╲╲╲ wavy navy SVG  ╲╲╲ │
│                                       ╲╲╲                ╲╲ │
│ [logo-icon]  MOLVEXA                                         │
│              Moulding Value with Excellence & Accuracy       │
│                                                              │
│                                                              │
│ Date: May 14, 2026                       QUOTATION FOR       │
│ Valid Until: May 21, 2026                                    │
│ Molvexa                              {customer.name}         │
│ Alavil, Kannur - 670008              KIND ATTN: {attention}  │
│ +91 96339 95120                      {address_line}          │
│ hello@molvexa.com                                            │
│ www.molvexa.com                                              │
│                                                              │
│ {TITLE IN BOLD}                                              │
│                                                              │
│ ┌─────────────────────────┬─────┬───────────┬──────────┐    │
│ │ ITEM DESCRIPTION (navy) │ QTY │ UNIT PRICE│ SUBTOTAL │    │
│ ├─────────────────────────┼─────┼───────────┼──────────┤    │
│ │ {description}           │ {q} │  ₹{u}.00  │ ₹{s}.00  │    │
│ │ ...                     │     │           │          │    │
│ └─────────────────────────┴─────┴───────────┴──────────┘    │
│                                                              │
│ TERMS & CONDITIONS:               Subtotal :   ₹X,XXX.00     │
│  • ...                            GST 18% :   ₹XXX.00        │
│  • ...                            ┌───────────────────────┐  │
│  • ...                            │ TOTAL :    ₹X,XXX.00  │  │
│  • ...                            └───────────────────────┘  │
│                                                              │
│ THANK YOU FOR YOUR BUSINESS.                                 │
│ We appreciate the opportunity ...                            │
│                                                              │
│ [stamp.png?]   For MOLVEXA                                   │
│                 Managing Partner                             │
│                                                              │
│  ╲╲╲ wavy navy SVG ╲╲╲           ─── thin navy line ───      │
└──────────────────────────────────────────────────────────────┘
```

### Shared `<DocumentPdf>` component

```ts
<DocumentPdf
  kind="quote" | "invoice"
  number="Q-2026-001"
  title=...
  date=...
  validUntilOrDueDate=...
  sender={MOLVEXA_PROFILE}    // imported from src/server/pdf/constants.ts; not in DB
  customer={...}
  items={[...]}
  gstPercent={18}
  terms={...}
  status="paid"?              // when invoice && paid, render "PAID" stamp/badge
/>
```

The kind prop drives:

- Header label: `QUOTATION FOR` vs `INVOICE TO`
- Number prefix display
- Optional "Valid Until" vs "Due Date" line
- Optional "PAID" badge overlay when invoice is paid

### Assets

- `logo-icon.png` (already in `/public`) — embedded top-left
- `logo-full.png` (already in `/public`) — used as the small "MOLVEXA" wordmark
  in the signature footer if a separate stamp file isn't present
- `stamp.png` (not yet present) — optional circular stamp. If
  `/public/stamp.png` exists at build time, it appears next to the signature
  line; if not, the signature line still renders cleanly without it.
- Wavy navy accents — inline SVG; no external file needed.

### Fonts

Default `@react-pdf/renderer` Helvetica is fine and avoids font-loading
complexity. If a closer brand match is needed later, we can register Inter or
Geist (already used by the marketing site) via `Font.register` — out of scope
for v1.

### INR formatting

```ts
const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', minimumFractionDigits: 2,
});
inr.format(20000); // "₹20,000.00"
```

### Filename

`Content-Disposition: attachment; filename="Q-2026-001.pdf"`
(or `INV-2026-001.pdf` for invoices). The number is the source of truth.

## 10. Critical flows

### F1 — Create a quote

1. Admin clicks "+ New Quote" on `/admin/quotes`.
2. Form opens. Fields:
   - Customer (combobox: pick existing, "+ Create new" inline)
   - Title (text, required)
   - Issue date (date picker, defaults to today)
   - Valid until (defaults to issue date + 7 days)
   - GST % (number, default 18)
   - Line items (at least 1; each: description, qty, unit price)
   - Terms (textarea, prefilled with STANDARD_TERMS; "Reset to default" button)
   - Notes (textarea, optional)
3. Live totals preview at the bottom: Subtotal · GST · Total.
4. Save (server action):
   - Begin transaction.
   - `counters` row for `('quote', extract(year from issue_date))` is upserted with `+1`.
   - Format number as `Q-{year}-{nnn}` (3-digit zero-padded; rolls naturally to 4 digits at item 1000).
   - Insert quote row + quote_items rows.
   - Commit.
5. Redirect to `/admin/quotes/[id]` (the view page).

### F2 — Download a quote PDF

1. View page → "Download PDF" button → links to `/api/admin/quotes/[id]/pdf`.
2. Server route: middleware verifies cookie; fetch the quote, customer, items;
   render `<DocumentPdf kind="quote" ... />`; pipe to Response stream.
3. Browser saves `Q-2026-001.pdf`.

### F3 — Convert quote to invoice

1. View page → "Convert to Invoice" button.
2. Server action:
   - Begin transaction.
   - Allocate next invoice number for current year.
   - Insert invoice row with all fields copied from quote (customer_id, title,
     gst_percent, terms, notes, items copied to invoice_items, status='draft',
     issue_date=today, due_date=today+14d).
   - Set `invoices.source_quote_id = quote.id`.
   - Set `quotes.converted_invoice_id = invoice.id`.
   - Set `quotes.status = 'accepted'` if it isn't already 'accepted'.
   - Commit.
3. Redirect to `/admin/invoices/[id]/edit` so the admin can tweak dates/terms
   before sending.

### F4 — Mark invoice paid

1. Invoice view → "Mark Paid" button → server action sets
   `status='paid'` and `paid_on=today`. View re-renders with green "Paid" pill.
2. Dashboard's "Outstanding invoices" total auto-updates on next load.

### F5 — Duplicate

Quote and invoice view pages have a "Duplicate" button that copies the record
(new id, new number, status='draft', dates reset to today) and redirects to the
new edit page. Useful for repeat-customer work.

### F6 — Edit

`/admin/[kind]/[id]/edit` opens the same form pre-populated. Save updates
in-place; the number is **never** regenerated. `updated_at` bumps.

### F7 — Delete

Each list row has a `⋯` menu with "Delete". Soft confirm via a dialog. On
confirm, hard-deletes the row (items cascade). Numbers are not reused — the
counter only ever moves forward.

## 11. Validation

Use **Zod** schemas (already implicit in modern Next.js patterns; the project
doesn't have it yet — to be added). One schema per entity, shared between the
server action and the client form via `react-hook-form`'s zodResolver.

Hard rules:

- `title`, `customer_id`, `issue_date` required.
- At least one line item.
- Each line item: `description` non-empty, `quantity > 0`, `unit_price >= 0`.
- `gst_percent` in `[0, 100]`.
- `valid_until >= issue_date` (quotes) / `due_date >= issue_date` (invoices).
- `number` server-generated; client cannot set it (defence-in-depth).

## 12. Error handling

| Scenario | Surface |
| --- | --- |
| DB connection fails on form submit | Toast "Couldn't save — try again in a moment", form keeps data |
| PDF route fails to fetch record | 404 page (`/admin/[kind]/[id]/pdf`) |
| Concurrent number allocation | Transaction handles it; if it ever errors, retry once, then surface |
| Cookie expired mid-edit | Server action throws auth error → caught by form wrapper → toast "Session expired, signing you out" → redirect to login |
| Unsaved changes warning | `useBeforeUnload` on dirty forms |

## 13. Testing strategy

Out of scope for v1 to set up a heavy testing harness, but the following
deserve at least one test:

- `formatRecordNumber(kind, year, n)` returns the right zero-padded string.
- `computeTotals(items, gstPercent)` matches expectations on edge values
  (empty items, fractional GST, very large numbers, zero unit price).
- Counter allocation is concurrency-safe (integration test against a real
  Postgres branch).
- Auth middleware redirects when cookie missing, allows through when valid.
- PDF route returns 200 + `application/pdf` for an existing record, 404 for a
  missing one, 302 for unauthenticated.

Use Vitest + Testing Library (lightweight, fits the existing stack). Skip
end-to-end browser tests for v1.

## 14. Migrations

`drizzle-kit` migrations live in `src/server/db/migrations/`. Initial migration
creates all tables in §6. Subsequent schema changes go in numbered follow-up
migrations.

Running migrations:

- Local: `pnpm db:migrate` → uses `DATABASE_URL_UNPOOLED`.
- CI: not in v1 scope. Manual local runs are enough for one admin.

## 15. Directory layout

```
src/
  app/
    admin/
      login/page.tsx
      layout.tsx                 // adds <AdminNav>, no marketing chrome
      page.tsx                   // dashboard
      customers/
        page.tsx
        new/page.tsx
        [id]/page.tsx
      quotes/
        page.tsx
        new/page.tsx
        [id]/page.tsx
        [id]/edit/page.tsx
      invoices/
        page.tsx
        new/page.tsx
        [id]/page.tsx
        [id]/edit/page.tsx
    api/
      admin/
        login/route.ts
        logout/route.ts
        quotes/[id]/pdf/route.ts
        invoices/[id]/pdf/route.ts
  components/
    admin/
      DocumentForm.tsx
      LineItemsEditor.tsx
      AdminNav.tsx
      ...
  server/
    auth/
      session.ts                 // sign/verify JWT
      password.ts                // constant-time compare, rate limit
    db/
      client.ts                  // drizzle({ schema }) using DATABASE_URL
      schema.ts                  // all tables in §6
      migrations/
    pdf/
      DocumentPdf.tsx            // shared <DocumentPdf> component
      assets.ts                  // logo + stamp loaders
      constants.ts               // MOLVEXA_PROFILE, NAVY color token, STANDARD_TERMS
      format.ts                  // inr, date formatters
    actions/
      customers.ts
      quotes.ts
      invoices.ts
    domain/
      numbering.ts               // formatRecordNumber, allocateNumber
      totals.ts                  // computeTotals
  middleware.ts                  // auth gate
```

Naming convention: existing pages live under `src/app/*` — the admin section
slots in under `src/app/admin/*` cleanly without disturbing anything. Server-
only code is grouped under `src/server/*` so it's obvious nothing in there
should be imported from a client component.

## 16. Open assumptions / future stories

Recording these so they don't slip into v1:

- A circular stamp image (`stamp.png`) will be uploaded later. The PDF degrades
  gracefully if it's not there.
- Email delivery of PDFs (Resend) is excluded. A future story can add a
  "Send to client" button that attaches the PDF.
- Public shareable links (e.g., `molvexa.com/q/<token>`) are excluded. Future
  story can add a token column and a read-only public route.
- Multi-currency / multi-language are excluded. Future story.
- Soft-delete and an audit log are excluded. Future story if needed.
- Multi-user accounts and per-user permissions are excluded. Future story if
  the team grows past one or two people.

## 17. Out-of-scope reminder

Anything not explicitly in §8 routes, §6 data model, or §10 flows is out of
scope. If a feature feels tempting during implementation but isn't here, it
goes to §16 and ships in a follow-up.
