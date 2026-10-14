const AREA_PREFIX_LENGTH = 2;

export type PriceArea = { label: string; from: string; to: string };

// Postal codes are text, so the area is a string range (first 2 digits, "01xx" is "0100" to "0199") that a btree index can use.
export function priceAreaOf(postalCode: string): PriceArea {
  const prefix = postalCode.slice(0, AREA_PREFIX_LENGTH);
  return {
    label: prefix.padEnd(postalCode.length, "x"),
    from: prefix.padEnd(postalCode.length, "0"),
    to: prefix.padEnd(postalCode.length, "9"),
  };
}

// null for a price from the user's own postal code; otherwise the label of the user's postal code area.
export function areaLabelOf(reportPostalCode: string, ownPostalCode: string): string | null {
  return reportPostalCode === ownPostalCode ? null : priceAreaOf(ownPostalCode).label;
}

export function isNearbyPrice(reportPostalCode: string, ownPostalCode: string): boolean {
  return reportPostalCode !== ownPostalCode;
}
