import { isValidBarcode } from "./barcode";
import type { ProductFormValues } from "./product-form-values";

export type ProductData = {
  barcode: string | null;
  pluCode: string | null;
  name: string;
  brand: string | null;
  description: string | null;
  weightG: number | null;
  volumeMl: number | null;
};

type Validation =
  | { ok: true; data: ProductData }
  | { ok: false; error: string; errorField?: "code" };

const DIGITS_PATTERN = /^\d+$/;

export function validateProduct(values: ProductFormValues): Validation {
  if (!values.name) return { ok: false, error: "Navn mangler" };

  if (!values.barcode && !values.pluCode) {
    return {
      ok: false,
      error: "Produktet trenger strekkode eller PLU-kode",
      errorField: "code",
    };
  }
  if (values.barcode && !isValidBarcode(values.barcode)) {
    return {
      ok: false,
      error: "Strekkode må være 8 til 14 siffer",
      errorField: "code",
    };
  }
  if (values.pluCode && !DIGITS_PATTERN.test(values.pluCode)) {
    return {
      ok: false,
      error: "PLU-kode må bestå av siffer",
      errorField: "code",
    };
  }

  const weightG = parsePositiveInteger(values.weightG);
  if (weightG === undefined) {
    return { ok: false, error: "Vekt må være et helt tall over 0" };
  }
  const volumeMl = parsePositiveInteger(values.volumeMl);
  if (volumeMl === undefined) {
    return { ok: false, error: "Volum må være et helt tall over 0" };
  }

  return {
    ok: true,
    data: {
      barcode: values.barcode || null,
      pluCode: values.pluCode || null,
      name: values.name,
      brand: values.brand || null,
      description: values.description || null,
      weightG,
      volumeMl,
    },
  };
}

/** Empty input gives null, a valid whole number above 0 gives the number, anything else gives undefined. */
function parsePositiveInteger(value: string): number | null | undefined {
  if (!value) return null;
  if (!DIGITS_PATTERN.test(value)) return undefined;
  const number = Number(value);
  return number > 0 ? number : undefined;
}
