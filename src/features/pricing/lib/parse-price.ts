const PRICE_PATTERN = /^\d{1,4}([.,]\d{1,2})?$/;

export function parsePriceToOre(input: string): number | null {
  const value = input.trim();
  if (!PRICE_PATTERN.test(value)) return null;
  return Math.round(Number(value.replace(",", ".")) * 100);
}
