# Location

Prices vary by postal code, so each user saves one postal code.

- Asked once with a "Hvor handler du?" card until saved. Editable on the profile page.
- Two ways to set it: tap "Bruk posisjonen min" (browser location, looked up with Kartverket's open address API) or type 4 digits.
- The form shows "Lagret" after a save. In the first-time card the prompt stays visible with "Lagret" until the next navigation. The no-data states (product page, shopping list) link to search and to the profile page to change the postal code.
- Place name next to the code is not built yet: it needs a postal code dataset (DECISIONS #3). Follow-up.
- Stored on `User.postalCode` and copied onto every `PriceReport` automatically, so reporting needs no postal code typing.
- Showing prices: the user's postal code first, then the nearest area with data, labelled. First version (DECISIONS #3, issue #37): the area is the first 2 digits of the postal code, so 0151 falls back to every code from 0100 to 0199. The label is "Priser fra 01xx" or "Pris fra 01xx". It is not real distance: a neighbour across a prefix border (0199 and 0200) is not found. The real version needs a postal code to coordinates dataset.
- Per store chain, the user's own postal code wins even when an Area price is newer or cheaper. A store chain without an own price gets the newest visible report in the Postal code area. `priceAreaOf` in `lib/price-area.ts` defines the area and its label, and `areaLabelOf` says whether a price is an own price (`null`) or an Area price (the label). The SQL for the rule is in `latestPricesPerStoreSql` (`src/features/pricing/lib/latest-prices-sql.ts`), described in `docs/domain/pricing.md`.
- Index: the range `"postalCode" BETWEEN '0100' AND '0199'` is a plain comparison, so it works with any collation. The index on product, store chain, postal code and time is used for the product (and store chain), then the range is filtered. That is fine for one product at a time; if a single product gets very many reports, revisit.
- Later, only if postal codes prove too coarse: a `StoreLocation` model for specific branches.

Code: `src/features/location`.
