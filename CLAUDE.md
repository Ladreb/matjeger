@AGENTS.md

# Matjeger

A Norwegian grocery price comparison PWA. Users scan product barcodes and report prices per store chain. The app shows which store is cheapest for a given shopping list.

## Stack

- **Frontend/Backend:** Next.js (App Router) with TypeScript
- **Database:** PostgreSQL via Neon (serverless), accessed with Prisma ORM
- **Auth:** NextAuth.js with @auth/prisma-adapter
- **Styling:** Tailwind CSS + shadcn/ui (new-york style, neutral base)
- **Theming:** next-themes — light/dark/system, toggled via `attribute="class"`
- **Barcode scanning:** @zxing/browser (camera access in browser)
- **PWA:** next-pwa (disabled in development)
- **Deployment:** Vercel

## Key conventions

- Prices are always stored as integers in **øre** (1 kr = 100 øre) to avoid floating point issues. Use `formatPrice()` from `@/lib/utils` to display them.
- Store chains are an enum in the Prisma schema (`Store`). Norwegian chains only — no location needed since pricing is national.
- Norwegian locale throughout: `lang="nb"`, price formatting with `nb-NO`.
- Prisma client is a singleton exported from `@/lib/db` as `db`.
- shadcn/ui components go in `src/components/ui/`. Use `npx shadcn@latest add <component>` to add new ones.

## Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npx prisma studio    # Open Prisma Studio (DB GUI)
npx prisma migrate dev --name <name>   # Create and apply a migration
npx prisma generate  # Regenerate Prisma client after schema changes
```

## Project structure

```
src/
  app/              # Next.js App Router pages and API routes
  components/
    ui/             # shadcn/ui components
  lib/
    db.ts           # Prisma client singleton
    utils.ts        # cn(), formatPrice()
prisma/
  schema.prisma     # Database schema
public/
  manifest.json     # PWA manifest
```
