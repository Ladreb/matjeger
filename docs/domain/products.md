# Products

- The catalogue is curated in-house. Only `PRODUCT_ADMIN` and `ADMIN` create and edit products. Norway has few enough groceries that this is feasible and gives better data than importing.
- A product has a barcode (EAN) or a PLU code (for loose goods), a name, optional brand, image, weight (grams) and volume (millilitres).
- Scanning an unknown barcode shows that the product is missing. Letting users propose it for admin review is a later feature.

Built: admins manage products at `/admin/products` (list, create, edit). The profile page links there for admins. Rules enforced on save: name is required, at least one of barcode (8 to 14 digits) or PLU code (digits), weight and volume are optional whole numbers above 0, barcode and PLU code are unique.

Scanning: `/scan` opens the camera (ZXing, EAN-13/EAN-8/UPC-A/UPC-E), looks the barcode up and shows the product name and brand, or a "not found" message. If the camera is unavailable or denied, the user types the barcode instead. The result does not link to a product page yet (comes with price reporting). Code: `src/features/scan`.

Not built: delete, image, search, proposals from users.

Code: `src/features/products`. Schema: `Product` in `prisma/schema.prisma`.
