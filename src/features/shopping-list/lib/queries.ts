import { Prisma, type Store } from "@prisma/client";
import { db } from "@/lib/db";
import type { ListItemData } from "../types/shopping-list";
import { currentListIdSql } from "./current-list";
import type { StorePrice } from "./plans";

type ItemRow = Omit<ListItemData, "createdAt"> & { createdAt: Date };

export async function findListItems(userId: string): Promise<ListItemData[]> {
  const rows = await db.$queryRaw<ItemRow[]>(Prisma.sql`
    SELECT i.id, i."productId", p.name, p.brand, i.quantity, i.checked, i."createdAt"
    FROM "ShoppingListItem" i
    JOIN "Product" p ON p.id = i."productId"
    WHERE i."listId" = ${currentListIdSql(userId)}
    ORDER BY i."createdAt", i.id
  `);
  return rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() }));
}

type PriceRow = Omit<StorePrice, "store"> & { store: string };

// One query for every product on the list. DISTINCT ON keeps the latest report per product and chain (DECISIONS #2); the ORDER BY must start with the same columns.
export async function findLatestListPrices(
  userId: string,
  postalCode: string,
): Promise<StorePrice[]> {
  const rows = await db.$queryRaw<PriceRow[]>(Prisma.sql`
    SELECT DISTINCT ON ("productId", "PriceReport".store) "productId", "PriceReport".store::text AS store, price, "reportedAt"
    FROM "PriceReport"
    WHERE "postalCode" = ${postalCode}
      AND "priceUnit" = 'PER_UNIT'
      AND "productId" IN (
        SELECT "productId" FROM "ShoppingListItem" WHERE "listId" = ${currentListIdSql(userId)}
      )
    ORDER BY "productId", "PriceReport".store, "reportedAt" DESC, id DESC
  `);
  return rows.map((row) => ({ ...row, store: row.store as Store }));
}

export async function isOnList(
  userId: string,
  productId: string,
): Promise<boolean> {
  const [row] = await db.$queryRaw<{ onList: boolean }[]>(Prisma.sql`
    SELECT EXISTS (
      SELECT 1 FROM "ShoppingListItem"
      WHERE "listId" = ${currentListIdSql(userId)} AND "productId" = ${productId}
    ) AS "onList"
  `);
  return row.onList;
}
