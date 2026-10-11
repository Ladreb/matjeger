# Roadmap

Update checkboxes as work lands.

## Done
- [x] Next.js 16 + Prisma + Neon scaffold
- [x] Google login (NextAuth v4), roles in session
- [x] Landing page, Nordic theme, light/dark toggle
- [x] App shell: header, bottom nav, auth guard
- [x] Schema: Product, PriceReport, User roles
- [x] Dev login and seed data for local testing (see `docs/technology/environments.md`)

## Next (in order)
0. [x] **Test environment**: create Neon `dev` branch, point `.env.development.local` at it (see DECISIONS #4)
1. [ ] **Location + schema**: done on dev, NOT yet on production
   - [x] Schema and migration on dev, "Where do you shop?" flow (geolocation or 4 digits, see DECISIONS #3)
   - [ ] Applied on production by the first production deploy (needs `PriceReport` to be empty, and a Neon restore point first)
2. [x] **Role guards**: `requireCatalogueEditor()` for pages and server actions
3. [x] **Admin product create/edit**: `/admin/products` (list, create, edit; no delete, no image yet)
4. [x] **Barcode scan**: ZXing camera scan on `/scan`, lookup, manual entry fallback
5. [x] **Price reporting**: chain + price form, latest price per chain on product page, staleness warning
6. [x] **Search**: product search by name/brand on `/search`, fuzzy, as you type, loading skeleton on the product page (measurements in `docs/technology/performance.md`)
7. [x] **Shopping list**: one list per user (schema allows several), add from search and product page, plan cards with the cheapest chain and at most 2 stops (see `docs/domain/shopping-list.md`)
8. [ ] **PWA**: icons, manifest, service worker (branch `fix/pwa-serwist` is unmerged)

## Before first real deploy
- [ ] Magic link login by email as a second option next to Google (DECISIONS #5): email sender (e.g. Resend), verified sending domain, rate limit on link requests
- [ ] Production Google OAuth client with production redirect URI (`/api/auth/callback/google`)
- [ ] Vercel env vars: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- [x] Preview deployments get their own Neon branch (Neon integration, Deployments Configuration, Preview)
- [ ] Check in the Vercel and Neon dashboards: functions run in `fra1` (set in `vercel.json`), and the Neon autosuspend delay is what you want (first search after a pause takes about 1.6 s)
- [ ] Check after the first production deploy that migrations ran (see `docs/technology/environments.md`). Includes `pg_trgm` (search) and the product `description` column. Check on production that `SELECT lower('Å')` returns `å` (search lowercases in the database; dev uses `C.UTF-8`, which works)

## Later
- [ ] Users propose unknown barcodes, admin review queue
- [ ] `StoreLocation` (specific branches)
- [ ] Price accuracy: when users report different prices, show a range or a consensus instead of only the latest (see `docs/domain/pricing.md`)
- [ ] Latest price per chain: Prisma `distinct` runs in memory and loads every report for the product and postal code; switch to `DISTINCT ON (store)` when reports grow
- [ ] Sale price and per-kg in the report form
- [ ] Search: split multi-word searches into words ("tine melk"), collapse double spaces in stored names ("Foo, bar" becomes "foo  bar" and misses the exact ranks), and add GIN trigram indexes on `Product` name, brand and description (the query scans every product today, which is fine for a curated catalogue); fold æ/ø/å so "ol" finds "øl"
- [x] Run Prisma migrations over the direct connection (`DATABASE_URL_UNPOOLED`) instead of the pooled one (done in `vercel.json`)
- [ ] Several shopping lists: names, an overview, a list picker, and `listId` passed to the actions instead of "the user's oldest list" (see `docs/domain/shopping-list.md`)
- [ ] Session lookup runs two queries per page (`@auth/prisma-adapter`) and is the fixed cost of every request; look at it if requests need to get faster
- [ ] More tests: Vitest runs with `npm test` and covers the plan ranking and staleness; actions, queries and components have none
- [ ] Think about UPC-A: the scanner reads 12-digit UPC-A codes, but products are probably stored as 13-digit EAN, so a lookup can miss. Possible fix: pad to 13 digits before lookup. Not prioritized

## Housekeeping
- [ ] Stale worktrees (`.claude/worktrees/*`) and branches
