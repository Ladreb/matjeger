# Users and roles

- Login is Google only (NextAuth, Prisma adapter). Pages under `src/app/(app)` redirect to `/login` without a session.
- Roles (`Role` enum): `USER`, `PRODUCT_ADMIN`, `ADMIN`. New users start as `USER`. Promote users by editing the row (Prisma Studio).
- `USER` reports prices. `PRODUCT_ADMIN` and `ADMIN` also create and edit products.
- The session carries `id`, `role` and `postalCode`.
- Not built yet: role checks. The next step is a `requireRole()` helper for server actions and pages.
