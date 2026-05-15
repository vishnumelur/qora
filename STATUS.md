# Current status — resume point

**Last session:** 2026-05-15 · **Snapshot for picking up later.**
Authoritative onboarding is `HANDOFF.md`; this file is just *where things stand and
what to do next*.

---

## ✅ Done (verified)

- **Git**: repo initialised, pushed to `https://github.com/vishnumelur/qora.git`,
  branch `main` tracking `origin/main`. Commits: `48c2ed0` (first commit, 112 files),
  `67826e1` (HANDOFF docs update). No secrets committed (`.env.local` gitignored,
  verified). Auth via `gh` CLI account `vishnumelur`.
- **Database**: schema migrated to the new DB — `npm run db:migrate`, migrations
  `0000`–`0002` applied successfully (uses `DATABASE_URL_UNPOOLED` from `.env.local`).
- **Verification**: `tsc --noEmit` clean · 49/49 tests pass (`npm test`) ·
  `npm run build` green (per handoff) · dev smoke test passed — `npm run dev`,
  `/` → 307 → `/admin` → 200 renders `Sign in | Invenex`, no DB error.
- **Env**: `.env.local` present with real `DATABASE_URL`, `DATABASE_URL_UNPOOLED`,
  `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` (filled by owner).

## ⏳ Not done — pick up here next (needs real Invenex data)

Priority order:

1. **Company profile** — `src/server/pdf/constants.ts` `INVENEX_PROFILE`: still all
   `TODO:` placeholders (tagline, address, phone, email, website, **GSTIN**). Fill
   real Invenex data — appears on every generated PDF.
2. **About copy** — `ABOUT_CONTENT` in the same file: placeholder `TODO:` text
   (originally Molvexa mould-engineering copy). Rewrite for Invenex's real business.
3. **Brand assets** — still Molvexa artwork: `public/logo-icon.png`,
   `public/logo-full.png`, `public/seal.png`, `public/favicon.png`,
   `src/app/favicon.ico`, `src/app/apple-icon.png`. Replace with Invenex logo +
   seal (same filenames/dims — seal renders at 65×65pt; see Molvexa dev-log for the
   sub-pixel-stroke lesson).
4. **Brand colour** — admin UI navy `#1a2744` (`globals.css`), PDF navy `#0F1E4F`
   (`src/server/pdf/constants.ts`). Change if Invenex's palette differs.

## ⚠️ Not yet exercised (no code change needed, just untested)

- **Authenticated admin session** — no login performed (admin password not used).
- **PDF generation** — quote/invoice PDF output never rendered in this project copy
  (historically fragile per Molvexa dev-log: sub-pixel strokes + image cache).

## How to resume quickly

```bash
cd ~/Desktop/invenex-invoice
git status                       # should be clean, on main
npm run dev                      # http://localhost:3000 → /admin
# log in with ADMIN_PASSWORD from .env.local, then create a test
# quote/invoice and download the PDF to validate items above
git push                         # upstream already set (origin/main)
```

Helper scripts (read `.env.local`): `scripts/issue-admin-token.mjs`,
`scripts/seed-test-quote.mjs`, `scripts/wipe-test-data.mjs`.
