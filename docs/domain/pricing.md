# Pricing

- A `PriceReport` links a product, a chain, a postal code and a price. Price is an integer in øre, with a `PER_UNIT` or `PER_KG` unit. A report can mark a sale price and keep the regular price.
- The latest report per product, chain and postal code is the current price.
- Reports older than 30 days (`STALE_AFTER_DAYS`) are shown with a warning, not hidden.
- Any logged-in user can report. The reporter's saved postal code is attached automatically.

## Built (step 5)
- Product page `/products/[id]`, reached from the scan result. Shows the latest price per chain for the user's saved postal code, cheapest first, with age and a staleness warning.
- Report form on the product page: chain and price in kroner (`29,90` or `29.90`, stored as øre). Always `PER_UNIT`, no sale info yet. Each submit inserts a new report, so history is kept and the same user can report the same chain again.
- Without a saved postal code the page asks for one and hides the form. With no reports for the postal code it says so.
- Code: `src/features/pricing` (`lib/parse-price.ts`, `lib/staleness.ts`, `lib/queries.ts`, `lib/actions.ts`, `components/`).

## Not built yet
- Sale price (`isOnSale`, `regularPrice`) and `PER_KG` in the form.
- Prices from the nearest area when the user's postal code has none (see DECISIONS #3).
- Accuracy across reports (range or consensus when users disagree). Every report is stored, so this needs no migration.

Schema: `PriceReport` in `prisma/schema.prisma`.
