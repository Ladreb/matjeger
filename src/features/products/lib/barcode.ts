const BARCODE_PATTERN = /^\d{8,14}$/;

export function isValidBarcode(value: string) {
  return BARCODE_PATTERN.test(value);
}
