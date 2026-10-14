# Pricing

- A `PriceReport` links a product, a store chain, a postal code and a price. Price is an integer in øre, with a `PER_UNIT` or `PER_KG` unit. A report can mark a sale price and keep the regular price.
- The latest report per product, store chain and postal code is the Price. How it is read, and when an Area price is used instead, is described in "Prices from the postal code area" below.
- A report can be hidden by an admin (`hiddenAt`, `hiddenById`). A hidden report is kept but ignored by every price read, so the latest price falls back to the previous visible report (see DECISIONS #7).
- Reports older than 30 days (`STALE_AFTER_DAYS`) are shown with a warning, not hidden.
- Any logged-in user can report. The reporter's saved postal code is attached automatically.

## Built (step 5)
- Product page `/products/[id]`, reached from the scan result. Shows the latest price per store chain for the user's saved postal code, cheapest first, with age and a staleness warning.
- Report form on the product page: store chain and price in kroner (`29,90` or `29.90`, stored as øre). Always `PER_UNIT`, no sale info yet. Each submit inserts a new report, so history is kept and the same user can report the same store chain again.
- Implausible prices: if the price is more than 3x or less than 1/3 of the median of the Prices on the page (latest per store chain), the server answers "Er du sikker?" and the form asks the user to confirm or change the price. The check is `isImplausiblePrice()` in `lib/plausibility.ts`. With no known prices, anything is accepted. Zero gets its own message ("Prisen må være over 0").
- Form feedback: the success and error messages disappear as soon as the user edits a field. After a success the price is reset and the store chain stays selected, and the updated price row is highlighted ("Oppdatert nå") until the next report.
- Without a saved postal code the form and prices are hidden; the app layout shows the "Hvor handler du?" card. With no reports for the postal code it says so.
- Code: `src/features/pricing` (`lib/parse-price.ts`, `lib/plausibility.ts`, `lib/staleness.ts`, `lib/queries.ts`, `lib/actions.ts`, `components/`).

## Store store chain buttons, last used and favourites
- The report form shows the store chains as buttons instead of a select. Order: the user's favourite store chains first, then the store chains the user has reported most, then the default order. The store chain of the user's newest report is preselected, and the store chain stays selected after a report is saved.
- Last used and most used are read from the user's own `PriceReport` rows (`findStorePreferences`), so they are stored nowhere else and follow the user across devices.
- Favourites are `User.favouriteStores` (`Store[]`, default empty). The user pins them under "Favorittbutikker" on `/profile` (`toggleFavouriteStore`). Pinned store chains show a star in the form.
- The form loads the preferences itself with the `loadStorePreferences` server action, so the product page and the scan card need no extra props. Until it answers (or fails) the buttons are grey placeholders of the same height, so the order does not jump under the user's thumb.
- On the scan card the form opens when the user taps "Rapporter pris", and the price field is focused then (`autoFocusPrice`).
- Code: `lib/store-preferences.ts` (ordering, tested), `components/store-chip-list.tsx`, `components/favourite-stores-form.tsx`.

## Accuracy across reports
- Product page: the cheapest row has a "Billigst" tag when there are two or more prices, the heading has an "Endre" link to `/profile` (postal code), and a line names store chains without a price (`describeMissingStores`) and invites a report. A "Til søk" back link sits above the title.
- The price shown is still the latest visible report (DECISIONS #8). Below it the product page says "Samme pris rapportert av N brukere de siste 30 dagene" when N is 2 or more.
- N is the number of distinct reporters whose latest visible report in the last 30 days (`STALE_AFTER_DAYS`) has the same store chain, postal code and price as the shown price (`countAgreeingReporters`, `findRecentVisibleReports`). Hidden reports are excluded. Reports without a reporter count one each.
- Only the product page shows it. Search, shopping list and the dashboard are unchanged. No migration.

## Hiding reports (admins)
- The edit page `/admin/products/[id]` has a "Prisrapporter" section (anchor `#prisrapporter`, linked from the "Billigst" cell on the dashboard): the newest 20 reports with price, store chain, postal code, reporter name (or "ukjent") and age. "Skjul" asks for confirmation; a hidden report stays in the list, struck through, with "Vis igjen".
- `hideReport` and `restoreReport` in `lib/actions.ts` call `requireCatalogueEditor()`; both admin roles can use them.
- A hidden report is ignored by every read of the Price. That rule lives in one place, see "Prices from the postal code area". `findRecentReports` is the only read that includes hidden reports, so an admin can show them again.

## Prices from the postal code area
The Price is the latest visible per-unit report for a product at a store chain, in the user's postal code (DECISIONS #2). When the user's own postal code has no report for a store chain, the newest visible report from the same Postal code area (first 2 digits, see `docs/domain/location.md`) is used instead. That is an Area price, and it is always labelled. A price from the user's own postal code always wins for its store chain. Reports are still saved with the user's own postal code.

One module decides this: `latestPricesPerStoreSql` in `src/features/pricing/lib/latest-prices-sql.ts`. It is a SQL fragment for one product, so a caller can run it inside its own query. It ignores hidden and per-kg reports, puts the own postal code first, picks the newest report per store chain (ties go to the higher report id) and returns nothing without a postal code. Every read that shows a Price runs it, so a new screen cannot forget a rule:
- `findLatestPricesPerStore` (same file as the other pricing reads, `lib/queries.ts`) runs it for one product and adds `areaLabel` to each price: `null` for a price from the own postal code, the area label (for example "01xx") for an Area price. The product page, the scan result and the plausibility check use it.
- Search runs it inside its lateral join on the final 50 rows and takes the cheapest price, so it costs no extra round trip. The result carries `cheapestAreaLabel`.
- The shopping list runs it once per list item inside one query (`findLatestListPrices`). Each price and plan line carries `areaLabel`.

What the screens show, all from `areaLabel` on the row:
- Product page: "Pris fra 01xx" on an Area price row. When no store chain has an own price the heading reads "Priser fra 01xx" with a line saying the own postal code has no reports.
- Plausibility check in `reportPrice`: uses the same prices as the page shows, so a first report in an empty postal code is still checked against its neighbours.
- Search: the cheapest price says "(pris fra 01xx)" when it is an Area price.
- Shopping list: each line with an Area price says "Pris fra 01xx", and the summary and plan card say how many ("Inkluderer N priser fra 01xx", `areaPriceLineCount`).
- Scan card: the cheapest price says "(pris fra 01xx)" when it is an Area price. After the user reports a price on the card, a new price from the own postal code replaces the shown price when the shown one is an Area price or is for the same store chain (even if higher); otherwise it only replaces it when lower (`cheapestAfterReport`).
- The empty states ("Ingen priser for postnummer … eller 01xx ennå") print the area label from the user's postal code, because there is no price row to take it from.

Reads that do not use the module, on purpose:
- `findRecentVisibleReports` (same-price count): exact postal code only, so the count never mixes areas, but it ignores hidden and per-kg reports like the module. A store chain with an Area price never shows the count, because the own postal code has no report for it.
- The admin dashboard (`dashboard-queries.ts`) and the admin report list (`findRecentReports`): admins see every postal code.
- `findStorePreferences`: reads the user's own reports, no postal code involved.

Tests: the module's rules are tested against a real Postgres (`npm run test:db`, see `docs/technology/environments.md`), through each reader: the product page read, search and the shopping list.

## Not built yet
- Sale price (`isOnSale`, `regularPrice`) and `PER_KG` in the form.
- Real distance for "nearby" (needs a postal code to coordinates dataset). A second, narrower step (3 digits before 2) was left out to keep the rule simple.
- Postal code chip next to the store chain in the report form, so the user can see and edit which postal code a report gets (DECISIONS #3).
- A median or range when users disagree. Only the same-price count is built (see "Accuracy across reports").

Schema: `PriceReport` in `prisma/schema.prisma`.
