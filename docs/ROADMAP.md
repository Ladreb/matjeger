# Roadmap

Update checkboxes as work lands.

## Done
- [x] Next.js 16 + Prisma + Neon scaffold
- [x] Google login (NextAuth v4), roles in session
- [x] Landing page, Nordic theme, light/dark toggle
- [x] App shell: header, bottom nav, auth guard
- [x] Schema: Product, PriceReport, User roles

## Next (in order)
0. [x] **Test environment**: create Neon `dev` branch, point `.env.development.local` at it (see DECISIONS #4)
1. [ ] **Location + schema**: schema and migration done on dev, NOT yet on production (needs `prisma migrate deploy`; fails if `PriceReport` has rows); "Where do you shop?" flow (see DECISIONS #3)
2. [x] **Role guards**: `requireCatalogueEditor()` for pages and server actions
3. [x] **Admin product create/edit**: `/admin/products` (list, create, edit; no delete, no image yet)
4. [ ] **Barcode scan**: ZXing camera scan on `/scan`, lookup, manual entry fallback
5. [ ] **Price reporting**: chain + price form, latest price per chain on product page, staleness warning
6. [ ] **Search**: product search by name/brand on `/search`
7. [ ] **Shopping list**: lists per user, cheapest chain for a list near the user's postal code
8. [ ] **PWA**: icons, manifest, service worker (branch `fix/pwa-serwist` is unmerged)

## Before first real deploy
- [ ] Production Google OAuth client with production redirect URI (`/api/auth/callback/google`)
- [ ] Vercel env vars: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- [ ] Run `prisma migrate deploy` on the production database (see `docs/technology/environments.md`)

## Later
- [ ] Users propose unknown barcodes, admin review queue
- [ ] `StoreLocation` (specific branches)
- [ ] Tests

## Housekeeping
- [ ] `package.json` name is still `fervent-johnson`
- [ ] Stale worktrees (`.claude/worktrees/*`) and branches
