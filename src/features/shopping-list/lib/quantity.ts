export const MIN_QUANTITY = 1;
export const MAX_QUANTITY = 99;

export function clampQuantity(quantity: number): number {
  return Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, quantity));
}
