# Architecture

## Layout

- `src/app`: routes only. Pages stay thin and compose feature code. `(public)` is open, `(app)` requires login.
- `src/features/<domain>/{components,lib,types}`: everything for one domain, front to back. Current domains: `auth`, `navigation`, `location`.
- `src/components/ui`: generic shadcn/ui components shared by all domains.
- `src/lib`: cross-domain helpers (`db`, `utils`).

## Wide screens

The phone layout is the product. From `lg` (1024 px) pages that have two natural halves use two columns, the rest stay a centred column.

- `PageColumn` (`src/components/page-column.tsx`) centres a page with a max width and gives it the one side padding of the app (16 px, `p-4`, plus more space at the top from `lg`). Pages must not add their own page padding. `narrow` 576 px (profile, scan, admin forms), `default` 672 px (search, empty shopping list), `wide` 1024 px (product page, shopping list, admin dashboard). It sets `data-page-width` so the header can follow it.
- Two-column pages use `wide` with `flex flex-col lg:grid lg:grid-cols-2`: the product page (product and list button left, prices and report form right) and the shopping list (items left, "Billigste butikk" right and sticky). Their `loading.tsx` skeletons use the same grid so the page does not jump.
- The header is as wide as the page below it (`group/app` on the app layout, `group-has-[[data-page-width=wide]]/app:max-w-5xl` on the header), so the logo lines up with the content.
- Buttons that are direct children of a `flex-col` get `sm:w-fit`, otherwise the column stretches them. Do not change `button.tsx`.
- From `lg` the links move into the header (`TopNav`) and the bottom nav is hidden. Below that, phones and tablets keep the bottom nav.

## Patterns

- **Server actions** in `<feature>/lib/actions.ts`, marked `"use server"`. Check the session first, validate input, write with Prisma, then `revalidatePath`. Return `{ ok: true, ... } | { ok: false, error }` and show the error in the UI. See `location/lib/actions.ts`.
- **Client components** only where interaction needs it (`"use client"`). Fetch and render on the server by default.
- **Reuse**: extract a component once it has two or more uses. Until then keep it next to its only user.
- **Prices** are integers in øre, formatted with `formatPrice()`.
- **Language**: UI text in Norwegian (`nb`).
