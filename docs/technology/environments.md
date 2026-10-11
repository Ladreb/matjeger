# Environments

Two environments, each with its own Neon database branch.

| | Test (local) | Production |
| --- | --- | --- |
| Database | Neon `dev` branch | Neon main branch |
| Config | `.env.development.local` | Vercel environment variables, `.env` locally |
| Used by | `npm run dev`, Prisma CLI | Vercel deployments |

## Dev tools (test environment only)

Set `ENABLE_DEV_TOOLS=true` in `.env.development.local` to turn these on. Never set it anywhere else.

- **Run it with `npm run dev`.** It binds to `127.0.0.1`, so only this computer can reach the server. `npm run dev:lan` listens on the network for testing on a phone and turns the dev tools off.
- **Dev login:** `/api/dev-login?role=USER|PRODUCT_ADMIN|ADMIN&next=/path` signs you in as a test user (`dev-<role>@matjeger.invalid`, postal code 0150) without Google. It creates a normal database session. It returns 404 unless `NODE_ENV` is not `production`, the flag is `true` the host is `localhost`, and the request is not marked cross-site. The Host header can be faked, so the loopback binding is the real protection: never expose the dev server with a tunnel such as ngrok while the flag is on. The cookie name assumes an `http://` `NEXTAUTH_URL`. Code: `src/features/auth/lib/dev-login.ts`.
- **Seed:** `npx prisma db seed` adds 10 test products (barcodes start with `200000000`, a GS1 in-store prefix) and price reports for postal code 0150, with ages from today to 60 days so the staleness warning shows. Safe to run again. It refuses to run without the flag.
- Both let a Claude session open any page without a real Google account.

## Rules

- `prisma.config.ts` loads `.env.development.local` before `.env`, so Prisma commands hit the test branch.
- `.env.development.local` holds only `DATABASE_URL` (pooled), `DATABASE_URL_UNPOOLED` (direct), the Google and NextAuth variables. Do not run `vercel env pull` over it: that fills it with production values.
- Create migrations with `npx prisma migrate dev --name <name>` (test branch).
- Apply to production deliberately with `npx prisma migrate deploy`, and before the code that needs the migration goes live.
- Never run `migrate dev` or `migrate reset` unless `.env.development.local` points at the test branch.
