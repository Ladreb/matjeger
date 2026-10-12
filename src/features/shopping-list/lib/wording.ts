import { formatPrice } from "@/lib/utils";

export function countItems(count: number): string {
  return count === 1 ? "1 vare" : `${count} varer`;
}

export function describeStalePrices(count: number): string {
  return count === 1
    ? "Inkluderer 1 gammel pris"
    : `Inkluderer ${count} gamle priser`;
}

export function describeNearbyPrices(count: number, areaLabel: string): string {
  return count === 1
    ? `Inkluderer 1 pris fra ${areaLabel}`
    : `Inkluderer ${count} priser fra ${areaLabel}`;
}

export function describeSaving(saving: number): string {
  return `Du sparer opptil ${formatPrice(saving)}`;
}
