import { describe, expect, it } from "vitest";
import { areaLabelOf, priceAreaOf } from "./price-area";

describe("priceAreaOf", () => {
  it("uses the first two digits as the area", () => {
    expect(priceAreaOf("0151")).toEqual({ label: "01xx", from: "0100", to: "0199" });
    expect(priceAreaOf("9990")).toEqual({ label: "99xx", from: "9900", to: "9999" });
  });
});

describe("priceAreaOf edge cases", () => {
  it("handles short and odd input without throwing", () => {
    expect(priceAreaOf("")).toEqual({ label: "", from: "", to: "" });
    expect(priceAreaOf("1")).toEqual({ label: "1", from: "1", to: "1" });
    expect(priceAreaOf("0")).toEqual({ label: "0", from: "0", to: "0" });
    expect(priceAreaOf("ab12")).toEqual({ label: "abxx", from: "ab00", to: "ab99" });
  });
});

describe("areaLabelOf", () => {
  it("is null for a price from the user's own postal code", () => {
    expect(areaLabelOf("0151", "0151")).toBeNull();
  });

  it("is the label of the user's postal code area for a price from another postal code", () => {
    expect(areaLabelOf("0182", "0151")).toBe("01xx");
  });
});
