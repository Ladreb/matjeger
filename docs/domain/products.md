# Products

- The catalogue is curated in-house. Only `PRODUCT_ADMIN` and `ADMIN` create and edit products. Norway has few enough groceries that this is feasible and gives better data than importing.
- A product has a barcode (EAN) or a PLU code (for loose goods), a name, optional brand, image, weight (grams) and volume (millilitres).
- Scanning an unknown barcode shows that the product is missing. Letting users propose it for admin review is a later feature.

Built: admins manage products at `/admin/products` (list, create, edit). The profile page links there for admins. Rules enforced on save: name is required, at least one of barcode (8 to 14 digits) or PLU code (digits), weight and volume are optional whole numbers above 0, barcode and PLU code are unique.

Scanning: `/scan` opens the camera (ZXing, EAN-13/EAN-8/UPC-A/UPC-E), looks the barcode up and shows the product name and brand, or a "not found" message. If the camera is unavailable or denied, the user types the barcode instead. The result does not link to a product page yet (comes with price reporting). Code: `src/features/scan`.

Search: `/search` has a text field that searches as you type: 200 ms after the last keystroke, from 2 letters, the URL becomes `?q=...` and the server renders the results, while the old results stay on screen (no blank flash) and the "Søk" button fades if the answer takes more than about 300 ms. A slow answer did not replace a newer one when tested with a delayed server. Typing replaces the history entry instead of adding one, so Back leaves the page, and clearing the field returns to the empty `/search`. Enter searches at once, even for one letter. Without JavaScript the form still works as a plain GET form. Matching is case-insensitive (works for æ, ø, å) and typo tolerant, using Postgres `pg_trgm`. Results are ranked from best to worst: whole word in name or brand, start of a word, inside a word, description, fuzzy match (a misspelling such as "lettmlek" or "havergryn"). At most 50 results, each linking to `/products/[id]`, which shows a loading skeleton at once when tapped. When nothing matches, the page says so. Short terms are strict: under 3 letters (is, te, øl) match only whole words and word starts, and fuzzy matching needs 4 or more letters, because shorter words have too few trigrams to tell a typo from noise. Fuzzy results are ordered by how close they are. The search term is lowercased, punctuation (`, . - / ( )`) is treated as a space, and it is cut at 100 characters. A search with several words matches them as one phrase ("tine melk" does not find "Lettmelk" by Tine, except through the fuzzy match). Not handled: spelling without æ, ø, å is not reliably found ("smor" for "smør" only just reaches the fuzzy threshold, and "ol" for "øl" does not). Code: `src/features/search`, query `searchProducts` in `src/features/products/lib/queries.ts`.

Description: an optional free-text field on each product, edited in the admin form, used by search (for example "iskrem, dessert" on an ice cream product). It is not shown to regular users yet.

Not built: delete, image, proposals from users.

Code: `src/features/products`. Schema: `Product` in `prisma/schema.prisma`.
