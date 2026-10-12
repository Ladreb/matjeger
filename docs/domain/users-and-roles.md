# Users and roles

- Login is Google only (NextAuth, Prisma adapter). Pages under `src/app/(app)` redirect to `/login` without a session.
- Roles (`Role` enum): `USER`, `PRODUCT_ADMIN`, `ADMIN`. New users start as `USER`. Promote users by editing the row (Prisma Studio).
- `USER` reports prices. `PRODUCT_ADMIN` and `ADMIN` also create and edit products, use the admin dashboard (`/admin/products`, with the unknown barcodes list and "Ignorer"), open `/admin/products/new?barcode=...`, and hide or show price reports on the product edit page.
- The session carries `id`, `role` and `postalCode`.
- Role checks: `canEditCatalogue(role)` says whether a role may manage products. `requireCatalogueEditor()` guards pages and server actions: no session goes to `/login`, wrong role gets a 404, so `/admin` is not revealed.
- A user can pin favourite chains (`favouriteStores`) on `/profile`. They are listed first in the price report form (see `pricing.md`).
