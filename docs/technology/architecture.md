# Architecture

## Layout

- `src/app`: routes only. Pages stay thin and compose feature code. `(public)` is open, `(app)` requires login.
- `src/features/<domain>/{components,lib,types}`: everything for one domain, front to back. Current domains: `auth`, `navigation`, `location`.
- `src/components/ui`: generic shadcn/ui components shared by all domains.
- `src/lib`: cross-domain helpers (`db`, `utils`).

## Wide screens

The phone layout is the product; wide screens centre it.

- `PageColumn` (`src/components/page-column.tsx`) centres a page with a max width and adds no padding. `narrow` 576 px (profile, scan, admin forms), `default` 672 px (search, product, shopping list), `wide` 1024 px (admin dashboard).
- Buttons that are direct children of a `flex-col` get `sm:w-fit`, otherwise the column stretches them. Do not change `button.tsx`.
- From `lg` (1024 px) the links move into the header (`TopNav`) and the bottom nav is hidden. Below that, phones and tablets keep the bottom nav.

## Patterns

- **Server actions** in `<feature>/lib/actions.ts`, marked `"use server"`. Check the session first, validate input, write with Prisma, then `revalidatePath`. Return `{ ok: true, ... } | { ok: false, error }` and show the error in the UI. See `location/lib/actions.ts`.
- **Client components** only where interaction needs it (`"use client"`). Fetch and render on the server by default.
- **Reuse**: extract a component once it has two or more uses. Until then keep it next to its only user.
- **Prices** are integers in øre, formatted with `formatPrice()`.
- **Language**: UI text in Norwegian (`nb`).
