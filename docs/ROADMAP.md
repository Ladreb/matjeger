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
   - [ ] `prisma migrate deploy` on production (fails if `PriceReport` has rows)
2. [x] **Role guards**: `requireCatalogueEditor()` for pages and server actions
3. [x] **Admin product create/edit**: `/admin/products` (list, create, edit; no delete, no image yet)
4. [x] **Barcode scan**: ZXing camera scan on `/scan`, lookup, manual entry fallback
5. [x] **Price reporting**: chain + price form, latest price per chain on product page, staleness warning
6. [ ] **Search**: product search by name/brand on `/search`
7. [ ] **Shopping list**: lists per user, cheapest chain for a list near the user's postal code
8. [ ] **PWA**: icons, manifest, service worker (branch `fix/pwa-serwist` is unmerged)

## Before first real deploy
- [ ] Magic link login by email as a second option next to Google (DECISIONS #5): email sender (e.g. Resend), verified sending domain, rate limit on link requests
- [ ] Production Google OAuth client with production redirect URI (`/api/auth/callback/google`)
- [ ] Vercel env vars: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- [ ] Run `prisma migrate deploy` on the production database (see `docs/technology/environments.md`)

## Later
- [ ] Users propose unknown barcodes, admin review queue
- [ ] `StoreLocation` (specific branches)
- [ ] Price accuracy: when users report different prices, show a range or a consensus instead of only the latest (see `docs/domain/pricing.md`)
- [ ] Latest price per chain: Prisma `distinct` runs in memory and loads every report for the product and postal code; switch to `DISTINCT ON (store)` when reports grow
- [ ] Sale price and per-kg in the report form
- [ ] Tests
- [ ] Think about UPC-A: the scanner reads 12-digit UPC-A codes, but products are probably stored as 13-digit EAN, so a lookup can miss. Possible fix: pad to 13 digits before lookup. Not prioritized

## Housekeeping
- [ ] `package.json` name is still `fervent-johnson`
- [ ] Stale worktrees (`.claude/worktrees/*`) and branches
