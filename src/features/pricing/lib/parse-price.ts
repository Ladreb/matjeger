const PRICE_PATTERN = /^\d{1,4}([.,]\d{1,2})?$/;

/** "29,99" or "29.99" gives 2999 øre. Anything invalid, or 0, gives null. */
export function parsePriceToOre(input: string): number | null {
  const value = input.trim();
  if (!PRICE_PATTERN.test(value)) return null;
  const ore = Math.round(Number(value.replace(",", ".")) * 100);
  return ore > 0 ? ore : null;
}
