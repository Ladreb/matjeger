# Pricing

- A `PriceReport` links a product, a chain, a postal code and a price. Price is an integer in øre, with a `PER_UNIT` or `PER_KG` unit. A report can mark a sale price and keep the regular price.
- The latest report per product, chain and postal code is the current price.
- Reports older than 30 days are shown with a warning, not hidden.
- Any logged-in user can report. The reporter's saved postal code is attached automatically.

Not built yet. Schema: `PriceReport` in `prisma/schema.prisma`.
