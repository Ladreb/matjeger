export const MIN_QUANTITY = 1;
export const MAX_QUANTITY = 99;

export function countItems(count: number): string {
  return count === 1 ? "1 vare" : `${count} varer`;
}

export function clampQuantity(quantity: number): number {
  return Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, quantity));
}
