# Products

- The catalogue is curated in-house. Only `PRODUCT_ADMIN` and `ADMIN` create and edit products. Norway has few enough groceries that this is feasible and gives better data than importing.
- A product has a barcode (EAN) or a PLU code (for loose goods), a name, optional brand, image, weight (grams) and volume (millilitres).
- Scanning an unknown barcode shows that the product is missing. Letting users propose it for admin review is a later feature.

Not built yet. Schema: `Product` in `prisma/schema.prisma`.
