import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { ShoppingListView } from "@/features/shopping-list/components/shopping-list-view";
import {
  findLatestListPrices,
  findListItems,
} from "@/features/shopping-list/lib/queries";

export default async function ShoppingListPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;
  const postalCode = session!.user.postalCode;

  const [items, prices] = await Promise.all([
    findListItems(userId),
    postalCode ? findLatestListPrices(userId, postalCode) : [],
  ]);

  return (
    <ShoppingListView
      initialItems={items}
      prices={prices}
      postalCode={postalCode}
      now={new Date()}
    />
  );
}
