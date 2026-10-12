import { describe, expect, it } from "vitest";
import { isNearbyPrice, nearbyPricesLabel, priceAreaOf } from "./price-area";

describe("priceAreaOf", () => {
  it("uses the first two digits as the area", () => {
    expect(priceAreaOf("0151")).toEqual({ label: "01xx", from: "0100", to: "0199" });
    expect(priceAreaOf("9990")).toEqual({ label: "99xx", from: "9900", to: "9999" });
  });
});

describe("isNearbyPrice", () => {
  it("is false for the user's own postal code and true for another one", () => {
    expect(isNearbyPrice("0151", "0151")).toBe(false);
    expect(isNearbyPrice("0150", "0151")).toBe(true);
  });
});

describe("nearbyPricesLabel", () => {
  it("names the area", () => {
    expect(nearbyPricesLabel("0151")).toBe("Priser fra 01xx");
  });
});
