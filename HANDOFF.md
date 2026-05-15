# Invenex — Quote & Invoice Studio (handoff)

This project is a **stripped + rebranded copy of the Molvexa codebase**, containing
**only the admin studio** (quote/invoice/customer maker + PDF generation). The public
marketing website was removed. It is meant to run on its **own Vercel project and its
own database** — nothing here shares infrastructure with Molvexa.

Generated on 2026-05-15 from `molvexa/molvexaweb` @ commit `9aea6a9`.

## Start here (fresh Claude session)

This is a clean, **verified-working** scaffold. Status as of handoff:
`npm install` done · `.env.local` has real DATABASE_URL / DATABASE_URL_UNPOOLED /
ADMIN_PASSWORD / ADMIN_SESSION_SECRET · `tsc --noEmit` clean · 49/49 tests pass ·
`npm run build` green. **Update 2026-05-15:** schema migrated to the new DB
(`npm run db:migrate` — migrations `0000`–`0002` applied successfully), git repo
initialised and pushed to `github.com/vishnumelur/qora` (`main`), and a dev smoke
test passed (`/` → 307 → `/admin`, `/admin` → 200 `Sign in | Invenex`). **Still
not done:** the brand TODOs below are unfilled (no login was performed — the admin
password was not used). Read the rest of this file, then the docs
in `docs/` (`brainstorming-session-results.md`, `prd.md`, `architecture.md`,
`front-end-spec.md`, `deployment.md`, `dev-log/`). The dev-log entries describe the
*Molvexa* build history — treat them as engineering reference (esp. the react-pdf
sub-pixel + image-cache lessons), not this project's own history.

---

## What was removed (marketing site)

`src/app/{about,contact,expertise,services,works,design-system}`, the marketing
landing `page.tsx` (now redirects to `/admin`), `sitemap.ts`, `robots.ts`,
`src/app/api/contact`, `src/components/{layout,sections,shared,ui}`, `src/hooks`,
`src/types`, `src/lib/{api,animations,constants}.ts`, `public/images`,
`og-image.png`, template SVGs, `components.json`. `layout.tsx` + `not-found.tsx`
were rewritten to drop marketing components.

## What was kept

`src/app/admin/**`, `src/app/api/admin/**`, `src/components/admin/**`, all of
`src/server/**` (db, actions, pdf, validation, domain, auth), `src/lib/utils.ts`,
`tests/`, `scripts/`, root config, `globals.css`, `public/fonts`, and the brand
image assets (still Molvexa's — see TODO).

## Rebrand done

All `Molvexa/MOLVEXA/molvexa` text + identifiers → `Invenex/INVENEX/invenex`
(wordmarks, `INVENEX_PROFILE`, session cookie `invenex_admin`, issuer
`invenex-admin`, package name `invenex-invoice`).

---

## ⚠️ TODO before this is production-usable

1. **Company details** — `src/server/pdf/constants.ts` `INVENEX_PROFILE` is all
   `TODO:` placeholders (tagline, address, phone, email, website, **GSTIN**). The
   old Molvexa values were deliberately NOT carried over. Fill real Invenex data.
2. **About-page copy** — `ABOUT_CONTENT` in the same file is placeholder `TODO:`
   text. Rewrite for Invenex's actual business (the original described mould
   engineering — almost certainly not Invenex).
3. **Brand image assets** — `public/logo-icon.png`, `public/logo-full.png`,
   `public/seal.png`, `public/favicon.png`, `src/app/favicon.ico`,
   `src/app/apple-icon.png` are **still Molvexa artwork**. Replace with Invenex's
   logo + rubber-stamp seal (same filenames, similar dimensions — the seal renders
   at 65×65pt; see the Molvexa dev-log for the sub-pixel-stroke lesson).
4. **Brand colour** — the admin UI navy is `#1a2744` and the PDF navy is `#0F1E4F`
   (`globals.css`, `src/server/pdf/constants.ts`). Change if Invenex's palette differs.
5. **Env** — copy `.env.example` → `.env.local` and set `DATABASE_URL`,
   `DATABASE_URL_UNPOOLED`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`
   (`openssl rand -hex 32`). These are the only vars the app uses.

---

## Git (done 2026-05-15)

Repository initialised here and pushed to a **new, empty** GitHub repo. No secrets
were committed — `.gitignore` line 34 (`.env*`) excludes `.env.local`; this was
verified with `git check-ignore` plus a staged-content secret scan before the first
commit (only the xkcd test fixture `correct horse battery staple` matched, in
`tests/unit/password.test.ts` — not a real credential).

| | |
|---|---|
| Remote (`origin`) | `https://github.com/vishnumelur/qora.git` |
| Default branch | `main` (tracking `origin/main`) |
| First commit | `48c2ed0` — `first commit` (112 files) |
| Auth | `gh` CLI, account `vishnumelur`, `repo` scope (HTTPS credential helper) |

Exact sequence used (the project's real `README.md` was kept — the GitHub
boilerplate's `echo "# qora" >> README.md` was deliberately **not** run):

```bash
git init
git add -A                       # .env.local excluded by .gitignore
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/vishnumelur/qora.git
git push -u origin main
```

Subsequent pushes: `git push` (upstream already set).

## First-time setup

```bash
cd ~/Desktop/invenex-invoice
npm install
cp .env.example .env.local      # then fill in the 4 values

# create the schema in the NEW database
npx drizzle-kit migrate          # uses DATABASE_URL_UNPOOLED

npm run dev                      # http://localhost:3000 → redirects to /admin
```

Admin login is a single shared password (`ADMIN_PASSWORD`). `scripts/` has helpers
(`issue-admin-token.mjs`, `seed-test-quote.mjs`, `wipe-test-data.mjs`) carried over
from Molvexa — they read `DATABASE_URL`/`ADMIN_*` from `.env.local`.

## Deploy (new Vercel project)

1. New Vercel project from this repo (after you `git init` + push to a new remote).
2. Add a Postgres DB (Neon via Marketplace) — sets `DATABASE_URL` /
   `DATABASE_URL_UNPOOLED`.
3. Add `ADMIN_PASSWORD` (Sensitive) + `ADMIN_SESSION_SECRET` env vars.
4. Run `drizzle-kit migrate` against the prod DB once.

## Verification status at handoff

Verified **in this directory with the real `.env.local`** (DB URLs + admin password
filled by the owner): `tsc --noEmit` clean, `npm run build` green, 49/49 tests pass
(`npm test` — server/pdf/domain + jsdom component tests, carried over unchanged).

**Re-verified 2026-05-15 after setup:** `tsc --noEmit` still clean, 49/49 tests
still pass, schema migrated to the new DB, and `npm run dev` boots cleanly —
`/` redirects (307) to `/admin`, which returns 200 and renders the rebranded
`Sign in | Invenex` login page with no DB error. **Not yet exercised:** an
authenticated session (no login performed) and PDF generation.
