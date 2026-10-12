import { clampQuantity } from "./quantity";

export type RestoredItem = {
  id: string;
  productId: string;
  quantity: number;
  checked: boolean;
  createdAt: string;
};

// The old id and createdAt are kept so an undone item returns to the same place and later saves still find it.
export function parseRestoredItem(item: RestoredItem) {
  const createdAt = new Date(item.createdAt);
  const valid =
    typeof item.id === "string" &&
    item.id.length > 0 &&
    typeof item.productId === "string" &&
    item.productId.length > 0 &&
    Number.isInteger(item.quantity) &&
    !Number.isNaN(createdAt.getTime());
  if (!valid) return null;

  return {
    id: item.id,
    productId: item.productId,
    quantity: clampQuantity(item.quantity),
    checked: item.checked === true,
    createdAt,
  };
}
