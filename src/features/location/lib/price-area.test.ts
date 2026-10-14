import { describe, expect, it } from "vitest";
import { isNearbyPrice, priceAreaOf } from "./price-area";

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

describe("isNearbyPrice", () => {
  it("is false for the user's own postal code and true for another one", () => {
    expect(isNearbyPrice("0151", "0151")).toBe(false);
    expect(isNearbyPrice("0150", "0151")).toBe(true);
  });
});
