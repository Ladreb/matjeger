# Performance

Measured 2026-10-11 on a production build (`npm run build` + `npm start`) against the Neon `dev` branch in `eu-central-1` (Frankfurt), from a laptop in Norway. Numbers are medians of 15 runs (the cold start is a single measurement), `localhost` to the Next server, so they exclude the user's own network.

| What | Time |
| --- | --- |
| Search request, warm | about 85 ms (same as `/search` with no query) |
| Search request, first one after 6 minutes idle | 1.6 s (Neon wakes up, Prisma reconnects) |
| One round trip to the database | about 37 ms |
| Search request with a term, warm, after the shopping list (needs the user id for `onList`) | about 118 ms |
| The search SQL inside Postgres (20 products) | 0.25 ms |
| Tap on a result, before `loading.tsx` | 247 ms with nothing on screen |
| Tap on a result, with `loading.tsx` | skeleton after about 40 ms |

What this means:

- **The search query is not the cost.** The request time is network round trips. The layout looks up the session (`@auth/prisma-adapter` runs two queries, session then user) while the page runs the search in parallel, so the search hides behind the session lookup. Making the SQL faster, or adding trigram GIN indexes, changes nothing today. Revisit when the catalogue is large (thousands of products); note that `word_similarity()` cannot use a GIN index, only the `<%` operator can.
- **Region matters more than anything in the code.** Each round trip is about 37 ms from Norway to Frankfurt. A Vercel function in the default region (`iad1`, Washington) would pay about 90 ms per round trip. `vercel.json` pins the functions to `fra1`, next to the database.
- **The first search after a pause is slow** because Neon suspends idle databases (the delay is a Neon setting; 5 minutes is the usual default, check the dashboard). It is a Neon plan setting, not code.
- **Links to `/products/[id]` are prefetched**, but a dynamic page can only be prefetched down to its `loading.tsx`. Without one, the prefetch is just the layout and a tap waits for the server. `prefetch={true}` would fetch the whole page for every result (up to 50 database-backed requests per search), so it is not used.
- **Search now needs the user id.** Each result says whether it is on the shopping list, so the page has to know the user before it can run the search. That adds one round trip (85 ms became about 118 ms, measured 2026-10-11 on a production build, median of 15). The search SQL itself is still not the cost. If it matters, the search SQL could look the user up from the session cookie itself and run in one wave.
- **The shopping list page** (about 120 ms) runs the list and the latest prices as two queries in parallel after the session. Prices are one `DISTINCT ON` query for every product on the list.
- **Cheapest price on each search result** is a `LEFT JOIN LATERAL` inside the search query, on the final 50 rows only, using the `PriceReport` index on product, chain, postal code and time. It is not a query per row and adds no round trip.
