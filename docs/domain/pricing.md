# Pricing

- A `PriceReport` links a product, a chain, a postal code and a price. Price is an integer in øre, with a `PER_UNIT` or `PER_KG` unit. A report can mark a sale price and keep the regular price.
- The latest report per product, chain and postal code is the current price.
- A report can be hidden by an admin (`hiddenAt`, `hiddenById`). A hidden report is kept but ignored by every price read, so the latest price falls back to the previous visible report (see DECISIONS #7).
- Reports older than 30 days (`STALE_AFTER_DAYS`) are shown with a warning, not hidden.
- Any logged-in user can report. The reporter's saved postal code is attached automatically.

## Built (step 5)
- Product page `/products/[id]`, reached from the scan result. Shows the latest price per chain for the user's saved postal code, cheapest first, with age and a staleness warning.
- Report form on the product page: chain and price in kroner (`29,90` or `29.90`, stored as øre). Always `PER_UNIT`, no sale info yet. Each submit inserts a new report, so history is kept and the same user can report the same chain again.
- Implausible prices: if the price is more than 3x or less than 1/3 of the median of the current prices (latest per chain, same postal code), the server answers "Er du sikker?" and the form asks the user to confirm or change the price. The check is `isImplausiblePrice()` in `lib/plausibility.ts`. With no known prices, anything is accepted. Zero gets its own message ("Prisen må være over 0").
- Form feedback: the success and error messages disappear as soon as the user edits a field. After a success the price is reset and the chain stays selected, and the updated price row is highlighted ("Oppdatert nå") until the next report.
- Without a saved postal code the form and prices are hidden; the app layout shows the "Hvor handler du?" card. With no reports for the postal code it says so.
- Code: `src/features/pricing` (`lib/parse-price.ts`, `lib/plausibility.ts`, `lib/staleness.ts`, `lib/queries.ts`, `lib/actions.ts`, `components/`).

## Chain buttons, last used and favourites
- The report form shows the chains as buttons instead of a select. Order: the user's favourite chains first, then the chains the user has reported most, then the default order. The chain of the user's newest report is preselected, and the chain stays selected after a report is saved.
- Last used and most used are read from the user's own `PriceReport` rows (`findStorePreferences`), so they are stored nowhere else and follow the user across devices.
- Favourites are `User.favouriteStores` (`Store[]`, default empty). The user pins them under "Favorittbutikker" on `/profile` (`toggleFavouriteStore`). Pinned chains show a star in the form.
- The form loads the preferences itself with the `loadStorePreferences` server action, so the product page and the scan card need no extra props. Until it answers (or fails) the buttons are grey placeholders of the same height, so the order does not jump under the user's thumb.
- On the scan card the form opens when the user taps "Rapporter pris", and the price field is focused then (`autoFocusPrice`).
- Code: `lib/store-preferences.ts` (ordering, tested), `components/store-chip-list.tsx`, `components/favourite-stores-form.tsx`.

## Accuracy across reports
- The price shown is still the latest visible report (DECISIONS #8). Below it the product page says "Samme pris rapportert av N brukere siste 30 dager" when N is 2 or more.
- N is the number of distinct reporters whose visible report in the last 30 days (`STALE_AFTER_DAYS`) has the same chain, postal code and price as the shown price (`countAgreeingReporters`, `findRecentVisibleReports`). Hidden reports are excluded. Reports without a reporter count one each.
- Only the product page shows it. Search, shopping list and the dashboard are unchanged. No migration.

## Hiding reports (admins)
- The edit page `/admin/products/[id]` has a "Prisrapporter" section (anchor `#prisrapporter`, linked from the "Billigst" cell on the dashboard): the newest 20 reports with price, chain, postal code, reporter name (or "ukjent") and age. "Skjul" asks for confirmation; a hidden report stays in the list, struck through, with "Vis igjen".
- `hideReport` and `restoreReport` in `lib/actions.ts` call `requireCatalogueEditor()`; both admin roles can use them.
- Every read of "latest price" filters on `hiddenAt` being null: `findLatestPricesPerStore` (product page, scan result, plausibility check in `reportPrice`), the search cheapest price (`products/lib/queries.ts`), the shopping list prices (`shopping-list/lib/queries.ts`) and the admin dashboard (`products/lib/dashboard-queries.ts`). A new query that reads `PriceReport` must do the same. `findRecentReports` is the only read that includes hidden reports.

## Not built yet
- Sale price (`isOnSale`, `regularPrice`) and `PER_KG` in the form.
- Prices from the nearest area when the user's postal code has none (see DECISIONS #3).
- Postal code chip next to the chain in the report form, so the user can see and edit which postal code a report gets (DECISIONS #3).
- A median or range when users disagree. Only the same-price count is built (see "Accuracy across reports").

Schema: `PriceReport` in `prisma/schema.prisma`.
