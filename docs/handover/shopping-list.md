# Handover: Shopping list (roadmap step 7)

**Temporary file. From the designer to the developer. Use it as reference input while building step 7. Delete it, and `shopping-list-mockup.html` next to it, once the reviewer says it can be deleted.**

Open `docs/handover/shopping-list-mockup.html` in a browser. The "velg tilstand" menu at the top switches screens and states (verified at 375 px, light and dark). It is a reference for layout and copy, not code to copy. Where this file and the mockup differ, this file wins.

Agreed with the product owner on 2026-10-11.

## Permanent docs

Update these only if necessary, meaning the built behaviour or a decision is not already recorded elsewhere. Suggestions:

| What | Where it could go |
| --- | --- |
| Decisions table | One short entry in `docs/DECISIONS.md` |
| Ranking rule, states, what the user sees | `docs/domain/shopping-list.md` |
| Roadmap step 7 | Tick the box in `docs/ROADMAP.md` |
| Query notes that explain a why (one query for prices, `DISTINCT ON`) | `docs/technology/performance.md` if measured, otherwise a short comment at the query |
| Copy, components, accessibility | Stay in the code. Do not copy to docs. |

## Goal

One shopping list per user. The app shows which chain is cheapest for the whole list at the user's postal code. When a chain lacks prices for some items, the plan fills the gaps from one other chain, so the user sees two "Handle hos" lists.

## Decisions

| Question | Decision |
| --- | --- |
| Lists per user | One. No overview, no names. |
| Adding products | A button on each search result and on the product page. Scan is covered because the scan result already links to the product page. |
| Quantities | Whole number 1 to 99, minus and plus. Line total is price times quantity. |
| Chain lacks prices | A plan per chain: its own items, plus the gaps bought at one other chain. Maximum 2 stops. |
| Stale prices (over 30 days) | Counted in totals, marked on the item and on the plan. Never hidden (DECISIONS #2). |
| Per-kg | Out. Only `PER_UNIT` prices are used. |
| Check off | In. One tick per item, saved, dims the item. Wording is generic ("markert"), because a tick does not mean the item was bought. |

## Smallest first slice

1. Add from search results and the product page.
2. `/shopping-list`: items with quantity, tick, remove, "Fjern markerte varer fra listen".
3. "Billigste butikk": ranked plan cards with the one-extra-stop fill.

## Out of scope

Several or named lists, sharing, per-kg, sale prices, free-text items, reordering, undo toast, count badge on the bottom nav, adding from the scanner, "nearest area" prices (DECISIONS #3), plans with 3 or more stops, notes per item, price history.

## Screens and states

Page shell as today: header, bottom nav (the "Handleliste" tab exists), `p-4`, `gap-4`. Mobile first. The mockup mode in brackets shows each state.

### 1. `/shopping-list` with items (Med varer)

Top to bottom:
- `h1` "Handlelisten" and a muted count line (`6 varer`). Give the `h1` `tabIndex={-1}`.
- Summary bar (a link to `#billigste-butikk`, `bg-secondary`, `rounded-lg`, two lines, chevron `aria-hidden`). Shown only when there is at least one plan. Text is `Billigst: Rema 1000, 185,60 kr` when rank 1 is complete. When rank 1 is partial it reads `Færrest varer mangler: Kiwi, fra 168,40 kr`. Never "Billigst" for a partial plan.
- The item list: `border rounded-lg divide-y`. One row per item: 44 px checkbox cell, then name (wraps, never truncated) with brand below in muted text, then the stepper, then a 44 px bin button on the right. If no chain has a price for the item: `Ingen pris i 0150 ennå` (muted, `text-sm`), only when the user has a postal code.
- A marked item has `line-through` and muted text, and stays in place. Order is oldest added first, then `id`, so rows never jump.
- Stepper: minus, number in an `<output aria-live="polite">`, plus. Minus is disabled at 1, plus at 99. Minus never removes. Only the bin removes. No confirm, no undo.
- `Fjern markerte varer fra listen (2)`: outline button under the list, only when 1 or more items are marked. After it runs, move focus to the `h1`.
- Section `id="billigste-butikk"` with `scroll-mt-16` (header is 56 px): see screen 2.

Saving: quantity, tick and remove change on screen at once, and save in the background. The action sends the new absolute quantity, never "plus one". Server Actions run one after another, so fast taps arrive in order. If one fails, go back to the last value the server confirmed and show under that item (`role="alert"`, `text-sm text-destructive`): `Kunne ikke lagre endringen. Prøv igjen.` Nothing is disabled while saving. After the bin removes an item, move focus to the `h1`.

### 2. "Billigste butikk" (plan cards)

`h2` "Billigste butikk", muted line `Priser for postnummer 0150`, then one card per plan in rank order. Use native `<details>`/`<summary>`: the first card is open, the rest closed.

Summary row of a card: rank number in a circle, chain name, total (right aligned, `font-semibold`), chevron (`aria-hidden`). Second line, muted: `Kiwi og Rema 1000 · 2 stopp`, or `Alt hos Kiwi · 1 stopp`. Then warnings (below).

Open card: one group per stop. Group header `Handle hos Kiwi` with the group sum on the right, then lines `2 × Lettmelk 1 l` with the line total on the right. Marked items are dimmed and struck through but still counted: the plan describes the whole list.

Rank circle and badge: rank 1 of a complete plan gets `bg-primary text-primary-foreground` and a small badge `Billigst` (`bg-accent text-accent-foreground rounded-full px-2 text-xs`). Every other card uses `bg-secondary`.

Warnings, shown in the summary row so they are visible when the card is closed. Amber text uses `text-amber-700 dark:text-amber-400`, always with words:
- Stale prices used: `Inkluderer 1 gammel pris` / `Inkluderer 2 gamle priser`. The line itself gets a second amber line: `Gammel pris, rapportert for 45 dager siden`. A stale price is always 31 days or more, so the line is always plural, no singular case.
- Partial plan (see ranking, step 5): total is prefixed `Fra`, plus a warning icon and `Mangler pris for 1 vare, totalen er minst 168,40 kr`. The open card ends with a group `Mangler i denne planen` listing those items and the note `Disse har pris i andre butikker, men ikke hos de to i denne planen.` (Mockup: Delvis dekket.)

Under the last card, when some item has no price at any chain: `Ingen pris ennå, ikke med i sammenligningen: Kaffe filtermalt 500 g.`

### 3. Empty list (Tom liste)

Centered, `py-12 px-4`, 40 px `ShoppingCart` icon in muted colour, `h1` `Handlelisten er tom`, one muted sentence, a primary button `Søk etter varer` (to `/search`) and a ghost button `Skann en vare` (to `/scan`). Both buttons 44 px high.

### 4. Loading (Laster)

`src/app/(app)/shopping-list/loading.tsx`, same pattern as `products/[id]/loading.tsx`: `animate-pulse`, `bg-muted` blocks, `<p role="status" className="sr-only">Laster…</p>`. Wrapper `gap-4 p-4` on purpose. Blocks: heading bar (w-1/2, h-7), summary bar (h-11), list block (h-56), second heading bar, card block (h-24).

### 5. No postal code (Uten postnummer)

The layout already shows the "Hvor handler du?" card above the page. The list works. The plan section only says `Lagre postnummeret ditt ovenfor for å se hvilken butikk som er billigst.` No summary bar, no "Ingen pris i ..." lines. Do not repeat the postal form.

### 6. Postal code saved, no prices for any item (Ingen priser)

Items show `Ingen pris i 0150 ennå`. Plan section: `Ingen har rapportert priser for varene på listen i 0150 ennå. Åpne en vare og rapporter prisen.` No summary bar.

### 7. Error fetching the list (Feil ved henting)

`src/app/(app)/shopping-list/error.tsx`. No `error.tsx` exists in the app yet, so this is the first. A client component (`"use client"`) taking `{ reset }`. Markup: `flex flex-1 flex-col items-center gap-3 p-6 text-center`, bold `Kunne ikke hente handlelisten.`, muted `Sjekk nettforbindelsen og prøv igjen.`, outline button `Prøv igjen` that calls `reset()`.

### 8. Add button in search results

Today the whole row is a `Link`. Change the `<li>` to `flex items-center`: the `Link` gets `flex-1 min-w-0` (same padding as now), and the add button sits to the right with `mr-1`. A button must not be inside the link.
- Not on the list: 44 px icon button (`Plus`), label `Legg til «Lettmelk 1 l» på handlelisten`.
- On the list: not a button. A `Check` icon in the primary colour with `role="img"` and label `«Lettmelk 1 l» er på handlelisten`.
- Tapping flips to the check at once. If saving fails, flip back and show `Kunne ikke legge til varen. Prøv igjen.` (`role="alert"`) under the row. For that the `<li>` becomes `flex-col` outside, with the `flex items-center` row inside. The component keeps its own state after a tap, so a late server refresh of the search page cannot flip it back.

### 9. Add button on the product page

Full width under the name and brand, above "Priser i ...", 44 px high, primary: `+ Legg til på handlelisten`. After adding: the icon and the text `På handlelisten` (plain text, not button-shaped) next to a bordered button `Se listen` linking to `/shopping-list`. Same error text as above under it. Shown whether or not the user has a postal code.

## How the result is ranked

Input: the list items (`productId`, `quantity`) and the latest `PER_UNIT` price per product and chain at the user's postal code (latest report wins, DECISIONS #2).

1. Set aside items that no chain has a price for. They are shown in the note under the cards and take no part in ranking. Otherwise one unpriced item would make every plan partial and nothing could ever be "Billigst".
2. For every chain `B` with a price for at least one remaining item, build a plan:
   - Base group: the items `B` has a price for, at `B`'s price.
   - Gaps: the other remaining items.
   - Extra chain: the other chain with a price for the most gaps. Ties: the lowest cost for those gaps, then chain name (Norwegian alphabetical order). A gap item always has a price at some other chain, so there is always an extra chain when there are gaps.
   - Gap group: the gaps the extra chain covers, at its price.
   - Uncovered: gaps the extra chain does not cover. Their presence makes the plan partial.
   - Total: sum of `price × quantity` over both groups. Count the plan lines (items, not units) that use a stale price (`isStale`).
3. Remove duplicates: two plans with the same chains holding the same items are one trip (A as base with B as extra can equal B as base with A as extra). Keep the first after sorting.
4. Sort: fewest uncovered items, then lowest total, then fewest stops, then chain name.
5. Complete plans (no uncovered items) always come before partial ones. Only a complete rank 1 gets the badge and the "Billigst" wording. "Mangler pris for N varer" counts items, not units.

Accepted, on purpose: base items are bought at the base chain even if another is cheaper; a small base group can win by a few øre over a one-stop plan; with a limit of 2 stops, a plan can be partial even though other chains have the price. Revisit with real data.

Write this as a pure function (items and prices in, ranked plans out) in `src/features/shopping-list/lib` and unit test it first. The mockup has a working reference (`computePlans`); write the real one in TypeScript, do not copy the HTML.

## Copy

All Norwegian text is in the screens above. Collected for checking:

| Where | Text |
| --- | --- |
| Count | 1 vare / 6 varer |
| Checkbox label | Marker «Lettmelk 1 l» |
| Stepper group / buttons | Antall «Lettmelk 1 l» / Færre «Lettmelk 1 l» / Flere «Lettmelk 1 l» |
| Bin label | Fjern «Lettmelk 1 l» fra listen |
| Clear button | Fjern markerte varer fra listen (2) |
| Stops | 1 stopp / 2 stopp |
| Group header | Handle hos Kiwi |
| Unpriced group | Mangler i denne planen |
| Product page buttons | Legg til på handlelisten / På handlelisten / Se listen |

Prices: `formatPrice(øre)`. Chain names: `STORE_LABELS`. No em dashes or en dashes anywhere in copy. All labels put the product name in «».

## Components

Reuse: `Button`, `Input`, `STORE_LABELS`, `formatPrice`, `isStale`, `daysSince`, `STALE_AFTER_DAYS`, the `loading.tsx` pattern, `lucide-react` icons (`Plus`, `Minus`, `Check`, `Trash2`, `ShoppingCart`, `ChevronDown`, `TriangleAlert`). `Button` is 36 px high by default: pass `className="h-11"` (or `size-11` for icon buttons) wherever this brief says 44 px. Tailwind merge lets it win.

New, in `src/features/shopping-list/components` unless noted:
- `AddToListButton`: search row and product page, so two uses. Prop `showLabel` picks icon-only or full width. Renders the button and the error text.
- `ShoppingListView` (client): holds the optimistic state for items **and computes the plans from it**, so totals, ranking and the summary bar follow the stepper at once. Plan data from the server is the price rows (dates serialize fine to a client component). The page stays thin.
- `ShoppingListItem`, `PlanCard`: one place of use, keep next to the view.
- Not new: no shared `Stepper` or `Badge` in `src/components/ui` (one use each).
- A small `formatStaleAge` next to `staleness.ts` for `Gammel pris, rapportert for N dager siden`. `describeAge` in `latest-prices.tsx` is private and has different wording, leave it.

## Accessibility

- Every tap target 44 x 44 px (tick cell, stepper buttons, bin, add button, summary bar, buttons).
- Tick is a real `<input type="checkbox">` with a label naming the product. State is also shown by line-through, never colour alone.
- Plan cards are native `<details>`. Warnings are words, not colour. The cheapest plan has rank number and badge.
- `role="alert"` for errors next to what failed, `role="status"` for loading.
- Focus: visible ring from the `ring` token; move focus to the `h1` after remove and after "Fjern markerte varer fra listen".
- Amber on `#f7f5f0` as used on the product page (`amber-600`) is about 3:1. The new warnings use `amber-700` (about 4.6:1). See open question 3.
- Text 16 px for names and prices, 14 px for secondary lines, nothing under 12 px. Check light and dark.

## Data and queries

Each database round trip is about 37 ms (`docs/technology/performance.md`). The layout's session lookup does not help pages: each page that needs the user id calls `getServerSession` itself (2 queries, session then user). Count one wave after that.

Suggested schema, developer decides:
```prisma
model ShoppingListItem {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  quantity  Int      @default(1)
  checked   Boolean  @default(false)
  createdAt DateTime @default(now())

  @@unique([userId, productId])
}
```
Add the back-relations on `User` and `Product`. The unique constraint already serves lookups by `userId`. No list table until there are several lists. Deleting a product that is on a list: the developer decides between cascade and restrict.

| Screen | Queries after the session |
| --- | --- |
| `/shopping-list` | One wave of 2, in parallel: (a) the user's items with `product.name` and `brand`, (b) the latest price per product and chain at the user's postal code, skipped when there is no postal code. |
| `/search` | The search SQL also returns `onList` per row (a `LEFT JOIN` or `EXISTS` on `ShoppingListItem` for the user). That keeps it to one wave after the session. Today `SearchView` has no session, so it gains the session lookup. This runs on every debounced keystroke, so measure it. |
| `/products/[id]` | One query for "on the list", in the same wave as the prices. Run it also when there is no postal code. |
| Add | One insert, do nothing if it exists (`createMany` with `skipDuplicates`, or upsert). A missing product fails on the foreign key: handle that, no pre-check. |
| Quantity, tick, remove | One `updateMany` or `deleteMany` with `where: { id, userId }`. That is also the ownership check. No read first. |
| Clear marked | One `deleteMany` with `where: { userId, checked: true }`. |

Query (b), raw SQL (`Prisma.sql`, values interpolated, not string-built). `DISTINCT ON` needs the matching `ORDER BY`:
```sql
SELECT DISTINCT ON ("productId", store) "productId", store, price, "reportedAt"
FROM "PriceReport"
WHERE "postalCode" = ${postalCode}
  AND "priceUnit" = 'PER_UNIT'
  AND "productId" IN (SELECT "productId" FROM "ShoppingListItem" WHERE "userId" = ${userId})
ORDER BY "productId", store, "reportedAt" DESC, id DESC
```
`$queryRaw` returns `store` as a plain string: type the rows and cast to `Store`. The existing index on `(productId, store, postalCode, reportedAt)` serves it. The product page's `findLatestPricesPerStore` does not filter on `priceUnit` today; the form only writes `PER_UNIT`, so this is not a visible difference yet.

Actions follow `reportPrice`: user from the session, return `{ ok: false, message }` instead of throwing, clamp quantity to 1..99 on the server, `revalidatePath("/shopping-list")`. The UI does not wait for the revalidation.

## Open questions

Recommended answer first. None blocks the build.

1. Tap the add button on a product already on the list: nothing happens (quantity is changed on the list). Alternative: add one more.
2. Show all chains (at most 9) as cards? Recommended yes. Revisit if it feels long.
3. Change the product page's `amber-600` to `amber-700`? Recommended yes, as a separate one-line PR.
4. Should the "Handle hos" lines get their own ticks? Recommended not now. Ticks live on the list above.
5. Postal codes with no prices while nearby codes have some: out of scope until "nearest area" exists (DECISIONS #3). The user sees screen 6.
