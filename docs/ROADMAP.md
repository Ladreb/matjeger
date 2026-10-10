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
2. [ ] **Role guards**: `requireRole()` helper for server actions and pages
3. [ ] **Admin product CRUD**: create/edit products (barcode, name, brand, weight/volume, image)
4. [ ] **Barcode scan**: ZXing camera scan on `/scan`, lookup, manual entry fallback
5. [ ] **Price reporting**: chain + price form, latest price per chain on product page, staleness warning
6. [ ] **Search**: product search by name/brand on `/search`
7. [ ] **Shopping list**: lists per user, cheapest chain for a list near the user's postal code
8. [ ] **PWA**: icons, manifest, service worker (branch `fix/pwa-serwist` is unmerged)

## Later
- [ ] Users propose unknown barcodes, admin review queue
- [ ] `StoreLocation` (specific branches)
- [ ] Tests

## Housekeeping
- [ ] `package.json` name is still `fervent-johnson`
- [ ] Empty skill folders in `.claude/skills/`
- [ ] Stale worktrees (`.claude/worktrees/*`) and branches
