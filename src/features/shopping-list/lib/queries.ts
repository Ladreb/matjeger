import { Prisma, type Store } from "@prisma/client";
import { areaLabelOf } from "@/features/location/lib/price-area";
import { latestPricesPerStoreSql } from "@/features/pricing/lib/latest-prices-sql";
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

type PriceRow = Omit<StorePrice, "store" | "areaLabel"> & { store: string; postalCode: string };

// One query for every product on the list: the shared price lookup runs once per list item inside it, the same way search does.
export async function findLatestListPrices(
  userId: string,
  postalCode: string | null | undefined,
): Promise<StorePrice[]> {
  if (!postalCode) return [];
  const rows = await db.$queryRaw<PriceRow[]>(Prisma.sql`
    SELECT i."productId", latest.store::text AS store, latest.price, latest."reportedAt", latest."postalCode"
    FROM "ShoppingListItem" i
    CROSS JOIN LATERAL (${latestPricesPerStoreSql(Prisma.sql`i."productId"`, postalCode)}) latest
    WHERE i."listId" = ${currentListIdSql(userId)}
    ORDER BY i."productId", latest.store
  `);
  return rows.map(({ postalCode: reportPostalCode, ...row }) => ({
    ...row,
    store: row.store as Store,
    areaLabel: areaLabelOf(reportPostalCode, postalCode),
  }));
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
