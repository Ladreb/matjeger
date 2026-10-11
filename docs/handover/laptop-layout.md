# Handover: laptop layout

Designer to developer. Delete this file when the reviewer says so.

## Goal

Make the app look intentional on a laptop (1024 to 1440 px) without touching the phone view. Today `main`, the header and the bottom nav are as wide as the window.

Two causes, both small:
1. Nothing limits the content width. Rows, cards and inputs stretch to 1280 px.
2. Buttons look "very long" because they sit in `flex flex-col` parents. A flex column stretches its children, so a `Button` becomes full width even though it never asked for it. This is why the fix is not only a max width: at 672 px a stretched button is still too long.

## Users

Mostly phone users in the store. Laptop users are the owner, admins entering products, and people who open a shared link at home. Admins on a laptop need the widest page (the dashboard, see `admin-dashboard.md`). Everyone else should get the phone layout in a centred column.

## Proposal

Rule: **the phone layout is the product. Wide screens centre it.** No two-column layouts in this round (see the last section).

### 1. Content column per page type

One small component, `src/components/page-column.tsx`. It has 3+ real uses from day one, so it earns its place. Width is data, not logic (CLAUDE.md, SOLID):

| Width | Tailwind | Pages |
| --- | --- | --- |
| `narrow` | `max-w-xl` (576 px) | `/profile`, `/scan`, `/admin/products/new`, `/admin/products/[id]` (forms) |
| `default` | `max-w-2xl` (672 px) | `/search`, `/products/[id]`, `/shopping-list` |
| `wide` | `max-w-5xl` (1024 px) | `/admin/products` (dashboard) only |

All use `mx-auto w-full`. The component adds no padding, so each page keeps the 16 px or 24 px it has today and the phone view stays pixel identical. (Padding inconsistency, UX review U18, is a separate decision.)

Where it goes:
- `src/app/(app)/layout.tsx`: do not clamp `main` here, because the admin dashboard needs to be wider than the rest. Wrap the "Hvor handler du?" banner in `PageColumn width="default"` so it lines up with the content below it.
- Each page's root `<div>` (or `src/features/*/components/*-view.tsx` for search and shopping list) becomes `<PageColumn width="...">` and keeps its own padding classes.
- `src/app/(app)/admin/layout.tsx` drops its fixed `p-6` wrapper only if the pages take over; simplest is to leave it and let the pages choose a column inside it.

Why these numbers: 672 px fits a plan card or a price row with the amount comfortably next to the name (about 70 characters of text). Wider and the eye has to travel too far between "Rema 1000" and "21,90 kr". Forms get 576 px because inputs wider than that look broken.

### 2. Buttons

- Below `sm` (640 px): unchanged. Full width where they are full width today.
- From `sm`: natural width. Add `sm:w-fit` to every `Button` that is a direct child of a `flex-col` container. `w-fit` is used instead of `self-start` because it also works in grids.
- Do not change `button.tsx`. Changing the base style would affect the places where full width is intended (the rows in the summary bar, the empty state on the shopping list).
- Known places to check (grep for `<Button` inside `flex-col`): `src/features/pricing/components/report-price-form.tsx` (submit), `src/features/shopping-list/components/add-to-list-button.tsx` with `showLabel` on the product page, `src/features/shopping-list/components/shopping-list-view.tsx` ("Fjern markerte varer fra listen", `h-11`), `src/features/location/components/postal-code-form.tsx`, `src/features/scan/components/manual-barcode-form.tsx`, the landing page in `src/app/(public)/page.tsx`.
- Keep `h-11` where it exists. Do not add it elsewhere; a 36 px button is fine with a mouse and the phone view must not change.
- Inputs stay full width inside the column. Only buttons shrink.

### 3. Navigation: top bar from `lg`, bottom nav below

**Recommendation: on screens 1024 px and wider, move the four links into the header and hide the bottom nav.** Below 1024 px (phones and tablets), nothing changes.

Why not keep the bottom nav, even centred:
- A bottom bar exists for the thumb. On a laptop it is the furthest point from the pointer and from where people look (top left).
- A centred 672 px bottom bar floating under a short page looks like a toolbar from a different app. A bar at the very bottom spanning 1280 px is what we have now and it is the problem.
- A top bar is the convention for web apps on a laptop, and it costs less code than a centred bottom bar with a border and background that must line up with the column.

Changes:
- `src/features/navigation/components/bottom-nav.tsx`: move the `links` array to its own `nav-links.ts` in the same folder (two users now). Add `lg:hidden` to the `<nav>`.
- New `src/features/navigation/components/top-nav.tsx` (client component, uses `usePathname` for the active state). Inline icon (`size-4`) plus label, `text-sm`, active link `text-primary`, same colours as the bottom nav.
- `src/features/navigation/components/header.tsx`: inner div becomes `mx-auto flex h-14 max-w-5xl items-center justify-between px-4`. Layout: logo, `TopNav` (`hidden lg:flex`, `gap-6`, placed after the logo), theme toggle on the right.
- `src/app/(app)/layout.tsx`: `pb-16` becomes `pb-16 lg:pb-0`.
- The public layout also uses the header? Check `src/app/(public)/layout.tsx`. If the logged-out header must not show the links, `TopNav` stays out of the shared `Header` and is passed in by the app layout as `children`.

Header width is `max-w-5xl` for every page, not per page. The links then sit in the same place on every page, and the logo does not jump between narrow and wide pages. The content column is narrower than the header on most pages. That is fine and normal.

### 4. Shopping list plan cards

No change. At 672 px the card (rank, store, total, details) reads well. Do not put cards in a grid: they are details elements that open downwards, and a grid makes neighbours jump when one opens. The summary bar link ("Billigst: ...") can stay full width in the column.

### 5. Product page

No change beyond the column and the button. Price rows at 672 px are fine.

### 6. Do two-column layouts earn their place?

**Not now.**
- Shopping list (items left, plans right, sticky) is the only real candidate. It would need `max-w-5xl`, a sticky container and a rethink of the "#billigste-butikk" anchor and the summary bar. That is a feature, not a layout fix, and no laptop user has asked for it. The owner's complaint is long buttons and stretched rows, and the column fixes both.
- Product page: it has 3 short sections. Two columns would leave both half empty.
- Revisit after the owner has used the centred layout for a week.

## States

- 375 px: identical to today. Check with a screenshot diff of every page before and after.
- 640 to 1023 px (tablet): centred column, buttons natural width, bottom nav still shown.
- 1024 px and wider: top bar, centred column, no bottom nav, no bottom padding.
- Dark and light: no new colours.
- Keyboard: top nav links are normal links in DOM order after the logo; keep the visible focus ring.

## Open questions

1. Should `lg` (1024) be the switch for the top bar, or `md` (768)? Recommendation `lg`, since a tablet in portrait is used like a phone.
2. Logged-out header: show the links? Only if the public layout shares `Header`; check before building.
3. Should padding be unified (16 px everywhere, UX review U18) at the same time? It would change mobile slightly on profile and admin pages. Recommendation: separate PR.

## Permanent docs

| Doc | Change |
| --- | --- |
| `docs/technology/` (add a short section to the closest architecture doc) | Column widths per page type, `PageColumn`, button rule, top bar from `lg` |
| `docs/ROADMAP.md` | Add "Laptop layout" as done when merged |
| `docs/UX-REVIEW-2026-10-11.md` | Nothing; it is a dated record |
