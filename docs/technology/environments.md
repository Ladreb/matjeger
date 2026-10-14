# Environments

Two environments, each with its own Neon database branch.

| | Test (local) | Production |
| --- | --- | --- |
| Database | Neon `dev` branch | Neon main branch |
| Config | `.env.development.local` | Vercel environment variables only |
| Used by | `npm run dev`, Prisma CLI | Vercel deployments |

## Dev tools (test environment only)

Set `ENABLE_DEV_TOOLS=true` in `.env.development.local` to turn these on. Never set it anywhere else.

- **Run it with `npm run dev`.** It binds to `127.0.0.1`, so only this computer can reach the server. `npm run dev:lan` listens on the network for testing on a phone and turns the dev tools off.
- **Dev login:** `/api/dev-login?role=USER|PRODUCT_ADMIN|ADMIN&next=/path` signs you in as a test user (`dev-<role>@matjeger.invalid`, postal code 0150) without Google. It creates a normal database session. It returns 404 unless `NODE_ENV` is not `production`, the flag is `true`, the `Host` header is `localhost` or `127.0.0.1`, and `Sec-Fetch-Site` is missing, `none` or `same-origin`. The Host check stops DNS rebinding, and `npm run dev` binds to `127.0.0.1` so other machines cannot connect. Never expose the dev server with a tunnel such as ngrok while the flag is on. The cookie name assumes an `http://` `NEXTAUTH_URL`. Code: `src/features/auth/lib/dev-login.ts`.
- **Seed:** `npx prisma db seed` adds 20 test products (barcodes start with `200000000`, a GS1 in-store prefix, with valid EAN-13 check digits so they can be scanned) and price reports for postal code 0150, with ages from today to 60 days so the staleness warning shows. The last 10 products have short names and tricky brands to test search. Safe to run again. It refuses to run without the flag.
- Both let a Claude session open any page without a real Google account.

## Database tests (throwaway Postgres)

`npm run test:db` runs the tests in `*.db.test.ts` files against a real Postgres that lives only for the run. It starts an embedded Postgres 17 (the `embedded-postgres` dev dependency, nothing to install on the machine), applies every migration with `prisma migrate deploy`, runs the tests and removes everything afterwards. The code is in `src/lib/test-db`.

- It never uses the Neon `dev` or production branch. The setup sets `DATABASE_URL` to its own `127.0.0.1` database on a free port and ignores the `.env` files, even when a different `DATABASE_URL` is already set.
- `npm test` (unit tests) does not run `*.db.test.ts` and needs no database, so it stays fast.
- Test files run one at a time because they share the one database. A test cleans up the rows it creates.
- Use it for rules that live in SQL or Prisma queries, where mocking the database would only test the query text.

## Rules

- **Production secrets never live in a file in the repo folder.** They live in Vercel's environment variables and in Neon.
- `.env.development.local` is the only env file. It holds `DATABASE_URL` (pooled), `DATABASE_URL_UNPOOLED` (direct), the Google and NextAuth variables, and `ENABLE_DEV_TOOLS`. It is gitignored. Do not run `vercel env pull` over it: that fills it with production values.
- `prisma.config.ts` reads only `.env.development.local`. If the file is missing, Prisma commands fail with "Environment variable not found" instead of reaching production.
- A git worktree has no env file, since it is gitignored. Link it before running anything there: `ln -s <main checkout>/.env.development.local .env.development.local`.
- Create migrations with `npx prisma migrate dev --name <name>` (test branch).
- Never run `migrate dev` or `migrate reset` unless `.env.development.local` points at the test branch.

## Applying migrations to production

Production deploys apply pending migrations themselves. `vercel.json` runs `scripts/vercel-build.sh`, which runs `prisma migrate deploy` over the direct connection (`DATABASE_URL_UNPOOLED`) when `VERCEL_ENV` is `production`, and then `next build`. If a migration fails, the build fails and the running version stays live, so code never goes live ahead of its schema.

Preview deployments each get their own Neon branch (`preview/<git-branch>`, copied from production), set up by the Neon integration in Vercel (Storage, the database, Connect Project, Deployments Configuration, Preview). Preview builds print the database host and run `prisma migrate deploy` on that branch, so a preview always has the current schema. The host in the build log shows which database a preview used.

Before merging a PR that adds a migration:
- Create a restore point in Neon (a branch from the production branch). A bad migration is not undone by redeploying.
- Keep migrations additive (add a column or table). Renaming or dropping something needs two deploys: add the new thing first, remove the old thing later. The old code runs against the new schema for a short time during a deploy.
- A migration that adds a required column fails if the table has rows and the column has no default (this is what blocks `add_postal_code` while `PriceReport` has rows).

To look at production by hand (see what is pending, or apply migrations in an emergency), get the **direct** (unpooled) production connection string from Neon and pass it for one command only:

```bash
DATABASE_URL="<production direct connection string>" npx prisma migrate status
```

The inline value wins over `.env.development.local`. Start the line with a space so the string stays out of your shell history (works when `HIST_IGNORE_SPACE` is on, which is the zsh option `setopt HIST_IGNORE_SPACE`). Never `export` it: the whole terminal session then talks to production, and a dev server started there does too.
