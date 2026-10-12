# Location

Prices vary by postal code, so each user saves one postal code.

- Asked once with a "Hvor handler du?" card until saved. Editable on the profile page.
- Two ways to set it: tap "Bruk posisjonen min" (browser location, looked up with Kartverket's open address API) or type 4 digits.
- The form shows "Lagret" after a save. In the first-time card the prompt stays visible with "Lagret" until the next navigation. The no-data states (product page, shopping list) link to search and to the profile page to change the postal code.
- Place name next to the code is not built yet: it needs a postal code dataset (DECISIONS #3). Follow-up.
- Stored on `User.postalCode` and copied onto every `PriceReport` automatically, so reporting needs no postal code typing.
- Showing prices: the user's postal code first, then the nearest area with data, labelled. The nearest-area lookup is not built (needs a postal code to coordinates dataset).
- Later, only if postal codes prove too coarse: a `StoreLocation` model for specific branches.

Code: `src/features/location`.
