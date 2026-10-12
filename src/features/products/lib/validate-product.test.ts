import { describe, expect, it } from "vitest";
import { emptyProductFormValues } from "./product-form-values";
import { validateProduct } from "./validate-product";

const valid = { ...emptyProductFormValues, name: "Melk", barcode: "7038010000001" };

describe("validateProduct", () => {
  it("accepts a product with only a barcode", () => {
    expect(validateProduct(valid).ok).toBe(true);
  });

  it("accepts a product with only a PLU code", () => {
    expect(validateProduct({ ...valid, barcode: "", pluCode: "4011" }).ok).toBe(true);
  });

  it.each([
    ["no barcode and no PLU code", { barcode: "", pluCode: "" }],
    ["a barcode that is too short", { barcode: "123" }],
    ["a PLU code with letters", { pluCode: "40a" }],
  ])("flags the code fields for %s", (_name, change) => {
    const result = validateProduct({ ...valid, ...change });
    expect(result).toMatchObject({ ok: false, errorField: "code" });
  });

  it("does not flag the code fields for a missing name", () => {
    const result = validateProduct({ ...valid, name: "" });
    expect(result).toEqual({ ok: false, error: "Navn mangler" });
  });
});
