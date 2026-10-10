# Environments

Two environments, each with its own Neon database branch.

| | Test (local) | Production |
| --- | --- | --- |
| Database | Neon `dev` branch | Neon main branch |
| Config | `.env.development.local` | Vercel environment variables, `.env` locally |
| Used by | `npm run dev`, Prisma CLI | Vercel deployments |

## Rules

- `prisma.config.ts` loads `.env.development.local` before `.env`, so Prisma commands hit the test branch.
- `.env.development.local` holds only `DATABASE_URL` (pooled), `DATABASE_URL_UNPOOLED` (direct), the Google and NextAuth variables. Do not run `vercel env pull` over it: that fills it with production values.
- Create migrations with `npx prisma migrate dev --name <name>` (test branch).
- Apply to production deliberately with `npx prisma migrate deploy`, and before the code that needs the migration goes live.
- Never run `migrate dev` or `migrate reset` unless `.env.development.local` points at the test branch.
