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
Open: how "nearest area" is computed (needs a postal code → coordinates dataset, e.g. Bring/Posten or Kartverket).

## 4. Two environments: local/test and production (decided, 2026-10-10)
Before this, `.env` and `.env.development.local` pointed at the same Neon database, so local work changed production.
- **Production:** the main Neon branch. Used by Vercel. Migrations are applied deliberately with `prisma migrate deploy`.
- **Local/test:** a separate Neon branch (e.g. `dev`). Its connection strings go in `.env.development.local`. `prisma.config.ts` reads that file first, so `prisma migrate dev` hits the dev branch.
- Never run `prisma migrate dev` while `.env.development.local` is missing or points at production.

## 5. Login: Google now, magic link later, no passwords (decided, 2026-10-11)
Reason for a second login: not everyone wants Google. Passwords were rejected: the Credentials provider forces JWT sessions (the app uses database sessions), and we would own hashing, verification, reset and rate limiting. Email magic link uses the existing `VerificationToken` model and links to the Google account by verified email. It needs an email sender and a domain, so it is planned together with the first production deploy. Testing without a real account uses the dev login (see `docs/technology/environments.md`), which is switched off outside local development.
