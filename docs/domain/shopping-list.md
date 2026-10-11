# Shopping list

Each user has a list. The app shows which chain is cheapest for the whole list at the user's postal code.

## What the user sees
- Add from a button on each search result and on the product page (the scan result links to the product page). Adding a product that is already on the list does nothing.
- `/shopping-list`: items oldest first, each with a tick, quantity 1 to 99 (minus and plus), and a bin. "Fjern markerte varer fra listen" removes every ticked item. A tick only dims the item, it does not mean bought.
- "Billigste butikk": one card per plan, cheapest first, the first one open. Stale prices (over 30 days) count in totals and are marked, never hidden.
- States: empty list, no postal code (list works, no plans), no prices at the postal code, loading, and an error page.
- Changes show at once and save in the background. A failed save goes back to the last saved value and shows an error under the item.

## Plans
Code: `src/features/shopping-list/lib/plans.ts` (pure, unit tested). The client view computes plans from its own state, so totals follow the stepper at once.
1. Items that no chain has a price for are set aside and listed under the cards. They do not take part in ranking.
2. Each chain with a price for at least one item gives a plan: its own items, plus the gaps bought at the one other chain that covers the most of them (ties: lowest cost, then chain name). At most 2 stops.
3. Two plans with the same chains and items are one trip.
4. Sort by fewest items without a price in the plan, then total, then stops, then chain name. Complete plans always come before partial ones. Only a complete first plan is called "Billigst".
5. Only `PER_UNIT` prices are used. The latest report per product and chain at the user's postal code wins (DECISIONS #2).

Accepted on purpose: base items are bought at the base chain even if another is cheaper, and with 2 stops a plan can be partial although other chains have the price.

## Data
- `ShoppingList` (user) and `ShoppingListItem` (list, product, quantity, checked), unique per list and product. Deleting a user, list or product removes the items.
- One list per user for now: the oldest. `currentListIdSql` in `lib/current-list.ts` finds it inside each query, and the first add creates it. Actions check ownership with `where: { id, list: { userId } }`, so each change is one query.
- The list page runs two queries after the session: the items, and the latest price per product and chain.

## Not built
Several or named lists, sharing, per-kg and sale prices, free-text items, reordering, undo, a count badge on the bottom nav, adding from the scanner, prices from the nearest area (DECISIONS #3), plans with 3 or more stops.
