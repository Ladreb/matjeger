export function countItems(count: number): string {
  return count === 1 ? "1 vare" : `${count} varer`;
}

export function describeStalePrices(count: number): string {
  return count === 1
    ? "Inkluderer 1 gammel pris"
    : `Inkluderer ${count} gamle priser`;
}
