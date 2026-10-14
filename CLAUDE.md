# Matjeger

A Norwegian grocery price comparison PWA. Users scan product barcodes and report prices per store chain. The user can create custom shopping lists and the app will show them which store is cheapest.

## Where to start

- `docs/ROADMAP.md` — what is built, what is next (keep checkboxes updated)
- `docs/DECISIONS.md` — product and technical decisions with reasons
- `docs/domain/` — what each domain does (products, pricing, location, users)
- `docs/technology/` — architecture patterns and environments (test vs production)

- `docs/handover/` — temporary hand-over files between roles (for example designer to developer). The developer:
  1. uses the file as reference input while building,
  2. updates the permanent docs only if necessary (see the file's "Permanent docs" table for suggestions),
  3. deletes the handover file once the reviewer says it can be deleted.

Update the matching domain or technology doc when you change behaviour.

## Rules
- Write in plain, clear language
- Ask clarifying questions before making assumptions
- When you are unsure, say so

## Stack

- **Frontend/Backend:** Next.js (App Router) with TypeScript
- **Database:** PostgreSQL via Neon (serverless), accessed with Prisma ORM
- **Auth:** NextAuth.js with @auth/prisma-adapter
- **Styling:** Tailwind CSS + shadcn/ui (new-york style, neutral base)
- **Theming:** next-themes — light/dark/system, toggled via `attribute="class"`
- **Barcode scanning:** @zxing/browser (camera access in browser)
- **PWA:** next-pwa (disabled in development)
- **Deployment:** Vercel

## Code principles

- **Group by domain.** Code lives in `src/features/<domain>/{components,lib,types}`. Pages in `src/app` stay thin and only compose feature code.
- **Reusable components, not by default.** Extract a component only once it has two or more real uses. Until then keep it next to its only user. Generic UI goes in `src/components/ui`, domain-specific UI stays in its feature.
- **YAGNI.** Build only what the current roadmap step needs. No speculative options, layers or abstractions.
- **Readable without comments.** Name functions and variables so the code explains itself. Comment only to explain why (a business rule, an odd external API), never what.
- **SOLID, applied to TypeScript.**
  - One reason to change per function or component.
  - Pass dependencies in instead of hardwiring them where it helps testing or reuse.
  - Extend behaviour with data (enums, config) instead of editing existing logic.
  - Keep types and props small and focused.

## Key conventions

- Prices are always stored as integers in **øre** (1 kr = 100 øre) to avoid floating point issues. Use `formatPrice()` from `@/lib/utils` to display them.
- Store chains are an enum in the Prisma schema (`Store`). Norwegian chains only.
- Prices can vary by postal code. Users save their postal code once and it is attached to reports automatically (see `docs/DECISIONS.md` #3).
- Latest price report wins. Old reports are shown with a staleness warning, not hidden.
- Products are curated in-house by admins (`PRODUCT_ADMIN`/`ADMIN`). Regular users report prices only. Letting users propose unknown barcodes is a later feature.
- Norwegian locale throughout: `lang="nb"`, price formatting with `nb-NO`.
- Prisma client is a singleton exported from `@/lib/db` as `db`.
- shadcn/ui components go in `src/components/ui/`. Use `npx shadcn@latest add <component>` to add new ones.

## Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm test             # Run unit tests (Vitest)
npm run test:db      # Run database tests against a throwaway Postgres (no setup needed)
npx prisma studio    # Open Prisma Studio (DB GUI)
npx prisma migrate dev --name <name>   # Create and apply a migration
npx prisma generate  # Regenerate Prisma client after schema changes
npx prisma db seed   # Add test products and prices to the dev database (needs ENABLE_DEV_TOOLS=true)
```

## Project structure

```
src/
  app/              # Next.js App Router pages and API routes
  components/
    ui/             # shadcn/ui components
  features/         # one folder per domain: components/, lib/, types/
  lib/
    db.ts           # Prisma client singleton
    utils.ts        # cn(), formatPrice()
prisma/
  schema.prisma     # Database schema
docs/               # roadmap, decisions, domain/, technology/
public/
  manifest.json     # PWA manifest
```

## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues (`Ladreb/matjeger`) via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
