"use server";

import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/features/auth/lib/auth";
import { db } from "@/lib/db";
import { currentListIdSql } from "./current-list";
import { clampQuantity } from "./quantity";

export type ListActionResult = { ok: true } | { ok: false; message: string };

const SAVE_FAILED = "Kunne ikke lagre endringen. Prøv igjen.";
const NOT_LOGGED_IN = "Du må være logget inn";

async function currentUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user.id ?? null;
}

async function findOrCreateListId(userId: string): Promise<string> {
  const findOldest = () =>
    db.shoppingList.findFirst({
      where: { userId },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: { id: true },
    });

  const existing = await findOldest();
  if (existing) return existing.id;

  await db.shoppingList.create({ data: { userId } });
  // Two tabs can create a list at once; the oldest wins, so both end up using it.
  return (await findOldest())!.id;
}

async function run(
  failureMessage: string,
  change: (userId: string) => Promise<boolean>,
): Promise<ListActionResult> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, message: NOT_LOGGED_IN };

  try {
    if (!(await change(userId))) return { ok: false, message: failureMessage };
  } catch (error) {
    console.error("shopping list change failed", error);
    return { ok: false, message: failureMessage };
  }

  revalidatePath("/shopping-list");
  return { ok: true };
}

export async function addToList(productId: string): Promise<ListActionResult> {
  return run("Kunne ikke legge til varen. Prøv igjen.", async (userId) => {
    const listId = await findOrCreateListId(userId);
    try {
      await db.shoppingListItem.createMany({
        data: [{ listId, productId }],
        skipDuplicates: true,
      });
    } catch (error) {
      const productMissing =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2003";
      if (productMissing) return false;
      throw error;
    }
    return true;
  });
}

export async function setQuantity(
  itemId: string,
  quantity: number,
): Promise<ListActionResult> {
  if (!Number.isInteger(quantity)) return { ok: false, message: SAVE_FAILED };
  const clamped = clampQuantity(quantity);

  return run(SAVE_FAILED, async (userId) => {
    const { count } = await db.shoppingListItem.updateMany({
      where: { id: itemId, list: { userId } },
      data: { quantity: clamped },
    });
    return count > 0;
  });
}

export async function setChecked(
  itemId: string,
  checked: boolean,
): Promise<ListActionResult> {
  return run(SAVE_FAILED, async (userId) => {
    const { count } = await db.shoppingListItem.updateMany({
      where: { id: itemId, list: { userId } },
      data: { checked },
    });
    return count > 0;
  });
}

export async function removeItem(itemId: string): Promise<ListActionResult> {
  return run(SAVE_FAILED, async (userId) => {
    await db.shoppingListItem.deleteMany({
      where: { id: itemId, list: { userId } },
    });
    return true;
  });
}

export async function clearCheckedItems(): Promise<ListActionResult> {
  return run(SAVE_FAILED, async (userId) => {
    await db.$executeRaw`
      DELETE FROM "ShoppingListItem"
      WHERE "listId" = ${currentListIdSql(userId)} AND checked = true
    `;
    return true;
  });
}
