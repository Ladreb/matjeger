# Decisions

Short log. Newest at the bottom. Status: decided / proposed.

## 1. Products are curated in-house (decided, 2026-10-10)
Only `PRODUCT_ADMIN` and `ADMIN` create and edit products. Reason: Norway has far fewer groceries than the US, so hand-curating is feasible and gives better data than importing from an outside source (e.g. Open Food Facts). Later feature: regular users can propose unknown barcodes for admin review.

## 2. Latest report wins (decided, 2026-10-10)
The most recent `PriceReport` per product, chain and postal code is the current price. Reports older than 30 days show a staleness warning (decided 2026-10-10).

## 3. Prices vary by postal code; ask once, attach automatically (decided, 2026-10-10)
Decided: pricing is not national, so reports need a location.
UX, to avoid typing postal codes on every report:
- Ask once ("Where do you shop?"), by geolocation or 4 digits. Save on the user profile.
- Attach it to each report automatically. Show as an editable chip next to the chain.
- Show prices for the user's postal code first, then the nearest area with data, labelled.
- Later, if too coarse: add a `StoreLocation` model for specific branches.
First version (issue #37): the area is the first 2 digits of the postal code, own postal code wins per chain, area prices are always labelled.
Open: how "nearest area" is computed for real (needs a postal code → coordinates dataset, e.g. Bring/Posten or Kartverket).

## 4. Two environments: local/test and production (decided, 2026-10-10)
Before this, `.env` and `.env.development.local` pointed at the same Neon database, so local work changed production.
- **Production:** the main Neon branch. Used by Vercel. Migrations are applied deliberately with `prisma migrate deploy`.
- **Local/test:** a separate Neon branch (e.g. `dev`). Its connection strings go in `.env.development.local`. `prisma.config.ts` reads only that file, so `prisma migrate dev` hits the dev branch.
- Never run `prisma migrate dev` while `.env.development.local` is missing or points at production.
- Updated 2026-10-11: no production URL on disk. Production values live in Vercel and Neon, and production migrations pass the URL inline for one command (see `docs/technology/environments.md`).
- Updated 2026-10-11 (later): production migrations run automatically in the Vercel production build (`vercel.json`), over the unpooled connection. Manual `migrate deploy` is only for emergencies (see `docs/technology/environments.md`).

## 5. Login: Google now, magic link later, no passwords (decided, 2026-10-11)
Reason for a second login: not everyone wants Google. Passwords were rejected: the Credentials provider forces JWT sessions (the app uses database sessions), and we would own hashing, verification, reset and rate limiting. Email magic link uses the existing `VerificationToken` model and links to the Google account by verified email. It needs an email sender and a domain, so it is planned together with the first production deploy. Testing without a real account uses the dev login (see `docs/technology/environments.md`), which is switched off outside local development.

## 6. Shopping list: a list table now, one list shown, at most 2 stops per plan (decided, 2026-10-11)
`ShoppingList` is its own table (owned by a user) and `ShoppingListItem` belongs to a list, unique per list and product. Reason: several lists per user is expected, and adding the table later would mean migrating every item. The app shows and uses the user's oldest list and creates it on the first add, so the UI has no names or overview yet. A plan is one chain plus, if it has gaps, one extra chain. More stops are not worth the walking. Ranking details are in `docs/domain/shopping-list.md`.

## 7. Hide, not delete, a bad price report (decided, 2026-10-12)
An admin hides a report (`PriceReport.hiddenAt`, `hiddenById`); nothing is deleted. Reason: a mistake is reversible, history is kept for the later accuracy work, and "latest wins" (#2) then falls back to the previous visible report. Both `PRODUCT_ADMIN` and `ADMIN` can hide. Admins see the reporter's name on the edit page.

## 8. Accuracy: show how many agree, keep latest wins (decided, 2026-10-12)
The shown price stays the latest visible report (#2). Next to it the product page shows how many distinct users, by each user's latest report, reported the same price for that chain in the last 30 days. Reason: it needs no change to which price wins, so search, shopping list and the dashboard stay consistent, and it still tells the user how much to trust the price. A median was rejected for now because a median across few reports can hide a real price change that the latest report shows.
