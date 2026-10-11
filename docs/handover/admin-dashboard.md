# Handover: admin dashboard

Designer to developer. Delete this file when the reviewer says so. Layout widths and the top bar come from `laptop-layout.md` (this page uses the `wide` column).

## Goal

Give catalogue admins one place to see what is missing or wrong, and fix it in few taps: products without prices, old prices, products without brand, barcodes people scanned that we do not have, and bad price reports. Also let an admin create a product by scanning.

## Users

`PRODUCT_ADMIN` and `ADMIN` (same guard today). Two situations:
- **In the store, on a phone**, holding a product: scan it, create it, move on.
- **At home, on a laptop**, cleaning up: work through the filters, fix one row at a time.

## Proposal

### Page and navigation

Keep the route `/admin/products`. It becomes the dashboard, with two tabs as plain links (server rendered, state in the URL): **Produkter** and **Ukjente strekkoder** (with a count badge). URL params: `tab`, `q`, `filter`, `page`. Reload and Back work, and an admin can share a filtered view.

Top of the page: title, "Nytt produkt" button (natural width from `sm`, see laptop doc), search field, filter chips.

### Tab 1: Produkter

**Search:** one field, matches name, brand or barcode/PLU. A string of 8 or more digits is treated as a barcode (exact match first). Searches as you type, same behaviour as `/search` (200 ms, URL replace). Reuse the pattern; if the component is reused as is, move it to `src/components/` since it then has two users.

**Filters** (chips, one at a time, URL `filter`). Recommendation: single choice, not combinable. It is simple and covers the owner's three cases. Combining can come when someone asks.
- Alle
- Uten priser (no visible report at all)
- Gamle priser (newest visible report older than 30 days; products with no reports go under "Uten priser" only, to avoid double counting)
- Uten merke

Each chip shows a count, so the dashboard doubles as a to-do overview ("Uten priser 12"). Sorting: name A to Å by default. On the laptop table, the column headers for Name, Priser and Siste rapport are sortable links (`sort`, `dir`). Not on the phone.

**Laptop table** (`wide` column, 1024 px, sticky header, row height about 48 px):

| Column | Content |
| --- | --- |
| Produkt | Name (medium), brand below in muted text. Link to edit |
| Strekkode / PLU | Monospace, muted |
| Kjeder | Number of chains with a price (e.g. "3 av 9") |
| Billigst | Price and chain (e.g. "21,90 kr, Rema 1000"); link to the reports section on the edit page |
| Siste rapport | Age ("i dag", "4 dager", "47 dager"), amber text and warning icon when over 30 days |
| (actions) | "Rediger" ghost button, right aligned |

Row click opens the edit page. A product with no prices shows "Ingen priser" in muted text in Kjeder and a dash in Billigst and Siste rapport. No brand shows a muted "Mangler merke" under the name, which is also how the "Uten merke" filter is visible.

**Phone** (list, same rule as today: whole row is one tap target):
- Line 1: name (medium). Line 2: brand and barcode (muted), or "Mangler merke".
- Line 3: "3 kjeder · fra 21,90 kr · 4 dager siden". Over 30 days: age in amber with the warning icon. No prices: a small "Uten priser" tag instead of line 3.
- No columns, no sorting. Filter chips scroll sideways in one row; search field above them.

**Paging:** 50 rows per page, "Forrige / Neste" links, "Viser 1 til 50 av 212". No infinite scroll, so Back keeps its place.

**Empty states:**
- No products at all: "Ingen produkter ennå." and a "Nytt produkt" button.
- No match for search or filter: "Ingen treff for «melk»." and "Fjern filter" link. A filter with no rows is good news and says so: "Alle produkter har pris. Bra jobbet." (Uten priser), "Alle priser er ferske." (Gamle priser).
- Search by barcode finds nothing: "Fant ingen produkt med strekkode 70380... Opprett produkt" (button to the new form, barcode prefilled).

### Tab 2: Ukjente strekkoder

A to-do list, sorted by number of scans (most wanted first).

- **Laptop table:** Strekkode (monospace), Antall skann, Sist skannet, actions: **Opprett produkt** (primary, small) and **Ignorer** (ghost).
- **Phone:** card per barcode: barcode large, "Skannet 7 ganger, sist i går", then the two buttons side by side (full width of the card is fine on the phone).
- **Opprett produkt** goes to `/admin/products/new?barcode=...` with the field prefilled. When the product is saved, the barcode drops off the list by itself (see queries).
- **Ignorer** hides a barcode (non-grocery items, test scans). One tap, with "Angre" shown in a toast for a few seconds. A second small link "Vis ignorerte" at the bottom lists them with "Gjenopprett".
- **Empty state:** "Ingen ukjente strekkoder. Når noen skanner en vare vi ikke har, dukker den opp her."

### Scan to add (new product form)

On `/admin/products/new` and the edit form, next to the barcode field: a "Skann" button (icon plus label) that opens the existing camera component inline above the field (no modal; no new shadcn component needed). A successful read fills the field and closes the camera. If the camera is denied or missing (common on a laptop), the panel says "Kamera er ikke tilgjengelig. Skriv inn strekkoden." and the field stays usable. If the code already belongs to a product, show "Finnes allerede: {name}" with a link, instead of failing at save (UX review A5). `src/features/scan/components/barcode-scanner.tsx` gets its second user here.

Also decided earlier: on `/scan`, an unknown barcode shows "Opprett produkt" for admin roles with the barcode prefilled (same URL as above).

### Hiding a bad price report

Where: the edit page `/admin/products/[id]`, new section "Prisrapporter" under the form (anchor `#prisrapporter`, linked from the "Billigst" cell on the dashboard).
- List of the newest 20 reports for this product, newest first: price, chain, postal code, reporter (name, or "ukjent"), age.
- Row action **Skjul** (destructive text style, with a confirm "Skjul denne rapporten?"). A hidden report stays in the list, struck through and greyed, with **Vis igjen**. Nothing is deleted, so a mistake is reversible and history stays.
- The "latest price" now falls back to the previous visible report, so hiding a 2 990 kr report restores the real price at once.
- Not building now: a cross-product list of newest reports (`/admin/reports`). Revisit if admins say they need to hunt for oddities. The dashboard filter "Gamle priser" and the product page cover the first version.

## Data and schema (brief)

Schema additions (one migration):
- `UnknownBarcodeScan`: `barcode` (id, unique), `count` Int, `firstSeenAt`, `lastSeenAt`, `dismissedAt` DateTime?. Written by `lookupBarcode` in `src/features/scan/lib/actions.ts` on a miss, as an upsert that adds 1. This is the table from UX review U2; the user also sees "Takk, vi har notert den".
- `PriceReport`: `hiddenAt` DateTime?, `hiddenById` String? (relation to `User`).

Queries (new in `src/features/products/lib/queries.ts` or an `admin` folder):
- **Dashboard rows:** one SQL query (`$queryRaw`, the "latest report per product, chain and postal code" is `DISTINCT ON`, already on the roadmap), joined to products, returning per product: chain count, cheapest price and chain, newest `reportedAt`. Filters are WHERE/HAVING on that result. Count per filter chip from the same query. Prisma `groupBy` cannot return the cheapest chain, so use raw SQL.
- **Which postal code?** The dashboard looks at all postal codes, since admins curate the catalogue, not an area. "Kjeder" means distinct chains with any current report anywhere.
- **Unknown barcodes:** scans where `dismissedAt` is null and no `Product` has that barcode (`NOT EXISTS`, so no cleanup job and no sync problem). Count for the badge from the same filter.
- **Hidden reports:** every query that finds the latest price (`src/features/pricing/lib/queries.ts`, `src/features/shopping-list/lib/queries.ts`) must add `hiddenAt: null`. Missing one makes the hide button lie, so cover it with a test.
- **Actions:** `hideReport`, `restoreReport`, `dismissBarcode`, `restoreBarcode`, all behind `requireCatalogueEditor()`.
- Search needs `ILIKE` or the existing trigram search on name, brand and barcode; the admin list is small, so no new index now.

## States to check

Loading skeleton for the table and the cards (same pattern as the product page), error with retry, a very long product name (truncate with ellipsis on the table, wrap on the phone), 0 and 1 products, a barcode that exists as PLU, double tap on Ignorer, hiding the only report on a product (it moves to "Uten priser").

## Open questions

1. "Gamle priser": newest report over 30 days (recommended, matches the column), or any chain's current price over 30 days?
2. Should "Ignorer" exist at all? Recommended, because junk scans will otherwise stay at the top of the list forever. It costs one column.
3. Should scans by admins count, or only by regular users? Recommended: count all, simpler.
4. Does scan counting need rate limiting (one user scanning the same code 50 times)? Recommended: count per scan for now, and look at it when it is noisy.
5. Can `ADMIN` hide reports and `PRODUCT_ADMIN` not? Recommended: both can, same guard as today.
6. Reporter name shown to admins: fine for privacy, or show only an id?

## Permanent docs

| Doc | Change |
| --- | --- |
| `docs/domain/products.md` | Dashboard, filters, unknown barcodes tab, scan on the form |
| `docs/domain/pricing.md` | Hidden reports and the rule that latest price ignores them |
| `docs/domain/users-and-roles.md` | What `PRODUCT_ADMIN` and `ADMIN` can do on the dashboard |
| `docs/ROADMAP.md` | Add and tick items; remove "Users propose unknown barcodes" dependency note if it changes |
| `docs/DECISIONS.md` | Hide, not delete, a price report (new entry) |
