import { Prisma } from "@prisma/client";

// One list per user for now: the oldest one. A subquery, so callers need no extra round trip to find it.
export function currentListIdSql(userId: string) {
  return Prisma.sql`(SELECT id FROM "ShoppingList" WHERE "userId" = ${userId} ORDER BY "createdAt", id LIMIT 1)`;
}
