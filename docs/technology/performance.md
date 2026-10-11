# Performance

Measured 2026-10-11 on a production build (`npm run build` + `npm start`) against the Neon `dev` branch in `eu-central-1` (Frankfurt), from a laptop in Norway. Numbers are medians of 15 runs (the cold start is a single measurement), `localhost` to the Next server, so they exclude the user's own network.

| What | Time |
| --- | --- |
| Search request, warm | about 85 ms (same as `/search` with no query) |
| Search request, first one after 6 minutes idle | 1.6 s (Neon wakes up, Prisma reconnects) |
| One round trip to the database | about 37 ms |
| The search SQL inside Postgres (20 products) | 0.25 ms |
| Tap on a result, before `loading.tsx` | 247 ms with nothing on screen |
| Tap on a result, with `loading.tsx` | skeleton after about 40 ms |

What this means:

- **The search query is not the cost.** The request time is network round trips. The layout looks up the session (`@auth/prisma-adapter` runs two queries, session then user) while the page runs the search in parallel, so the search hides behind the session lookup. Making the SQL faster, or adding trigram GIN indexes, changes nothing today. Revisit when the catalogue is large (thousands of products); note that `word_similarity()` cannot use a GIN index, only the `<%` operator can.
- **Region matters more than anything in the code.** Each round trip is about 37 ms from Norway to Frankfurt. A Vercel function in the default region (`iad1`, Washington) would pay about 90 ms per round trip. `vercel.json` pins the functions to `fra1`, next to the database.
- **The first search after a pause is slow** because Neon suspends idle databases (the delay is a Neon setting; 5 minutes is the usual default, check the dashboard). It is a Neon plan setting, not code.
- **Links to `/products/[id]` are prefetched**, but a dynamic page can only be prefetched down to its `loading.tsx`. Without one, the prefetch is just the layout and a tap waits for the server. `prefetch={true}` would fetch the whole page for every result (up to 50 database-backed requests per search), so it is not used.
