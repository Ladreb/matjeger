const IMPLAUSIBLE_FACTOR = 3;

export function medianPrice(prices: number[]): number | null {
  if (prices.length === 0) return null;
  const sorted = [...prices].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[middle];
  return Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

export function isImplausiblePrice(price: number, knownPrices: number[]): boolean {
  const median = medianPrice(knownPrices);
  if (median === null) return false;
  return price > median * IMPLAUSIBLE_FACTOR || price < median / IMPLAUSIBLE_FACTOR;
}
