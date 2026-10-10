import { db } from "@/lib/db";

export function listProducts() {
  return db.product.findMany({ orderBy: { name: "asc" } });
}

export function findProduct(id: string) {
  return db.product.findUnique({ where: { id } });
}

export function findProductByBarcode(barcode: string) {
  return db.product.findUnique({
    where: { barcode },
    select: { id: true, name: true, brand: true },
  });
}
