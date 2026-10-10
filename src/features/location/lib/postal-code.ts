export function isValidPostalCode(value: string): boolean {
  return /^\d{4}$/.test(value);
}
