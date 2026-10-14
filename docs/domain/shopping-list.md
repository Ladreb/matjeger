# Shopping list

Each user has a list. The app shows which store chain is cheapest for the whole list at the user's postal code, using an Area price where the own postal code has no price.

## What the user sees
- Add from a button on each search result and on the product page (the scan result card has the same button). Adding a product that is already on the list does nothing. After an add in search, "Lagt til. Se listen" shows under the row and the check is a button that removes the item again. On the product page "Fjern" sits next to "Se listen".
- `/shopping-list`: items oldest first, each with a tick, quantity 1 to 99 (minus and plus), and a bin (set apart from the stepper). Stepper, bin and tick are at least 44 px. "Fjern markerte varer fra listen" removes every ticked item. A tick is only a visual aid: it dims the item and strikes it through in the list, and the whole name area is tappable. It does not mean bought, and the plan cards, prices and totals do not change.
- A summary bar at the top links to the plans. It names the best plan and its total, and adds "Du sparer opptil X kr", the number of stops and a stale price warning when they apply.
- "Billigste butikk": plan cards, cheapest first, the first one open. Only the first 3 show, a "Vis alle (n)" button shows the rest. Stale prices (over 30 days) count in totals and are marked, never hidden.
- After removing an item or clearing ticked items, a bar at the bottom shows "Angre" for 6 seconds. The item is deleted at once and undo puts it back with the same id, quantity, tick and place in the list (`restoreItems`, `lib/restore.ts`). Only the last removal can be undone. If the same product is added again before "Angre" is tapped, undo does nothing for that product on the server, so the screen and the saved list can differ until the page is reloaded.
- States: empty list, no postal code (list works, no plans), no prices at the postal code, loading, and an error page.
- The page takes fresh server data (for example an item added on another page) when no change of its own is still saving.
- Changes show at once and save in the background. A failed save goes back to the last saved value and shows an error under the item.

## Plans
Code: `src/features/shopping-list/lib/plans.ts` (pure, unit tested). The client view computes plans from its own state, so totals follow the stepper at once.
1. Items that no store chain has a price for are set aside and listed under the cards. They do not take part in ranking.
2. Each store chain with a price for at least one item gives a plan: its own items, plus the gaps bought at the one other store chain that covers the most of them (ties: lowest cost, then store chain name). At most 2 stops.
3. Two plans with the same store chains and items are one trip.
4. Sort by fewest items without a price in the plan, then total, then stops, then store chain name. Complete plans always come before partial ones. Only a complete first plan is called "Billigst".
5. "Du sparer opptil": the total of the most expensive complete plan minus the total of the cheapest one (`maxSaving` in `plans.ts`). Shown on the summary bar and the first plan card, only when the first plan is complete. Hidden with fewer than 2 complete plans or a gap of 0. Partial plans never count.
6. The prices come from the shared latest price rules (`findLatestListPrices`, which runs `latestPricesPerStoreSql` once per list item, see `pricing.md`). Only `PER_UNIT` reports count and hidden reports are ignored. The latest report per product and store chain at the user's postal code wins (DECISIONS #2). Where the own postal code has no report for a store chain, the newest report from the same postal code area is used as an Area price. Each line then says "Pris fra 01xx", and the summary and plan card say how many ("Inkluderer N priser fra 01xx"). Without a postal code there are no prices and no plans.

Accepted on purpose: the plans use only `PER_UNIT` prices while the product page does not filter on `priceUnit` yet (the form only writes `PER_UNIT`), the "Handle hos" lines have no ticks of their own, base items are bought at the base store chain even if another is cheaper, and with 2 stops a plan can be partial although other store chains have the price.

## Data
- `ShoppingList` (user) and `ShoppingListItem` (list, product, quantity, checked), unique per list and product. Deleting a user, list or product removes the items.
- One list per user for now: the oldest. `currentListIdSql` in `lib/current-list.ts` finds it inside each query, and the first add creates it. Actions check ownership with `where: { id, list: { userId } }`, so each change is one query.
- The list page runs two queries after the session: the items, and the latest price per list item and store chain (one lookup per item).

## Not built
Several or named lists, sharing, per-kg and sale prices, free-text items, reordering, undo after the 6 seconds or after leaving the page, a count badge on the bottom nav, plans with 3 or more stops.
