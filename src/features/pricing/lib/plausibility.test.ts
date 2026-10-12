import { describe, expect, it } from "vitest";
import { isImplausiblePrice, medianPrice } from "./plausibility";

describe("medianPrice", () => {
  it("is null without prices", () => {
    expect(medianPrice([])).toBeNull();
  });

  it("takes the middle price of an odd count", () => {
    expect(medianPrice([3000, 1000, 2000])).toBe(2000);
  });

  it("averages the two middle prices of an even count", () => {
    expect(medianPrice([1000, 2000, 3000, 4001])).toBe(2500);
  });
});

describe("isImplausiblePrice", () => {
  const known = [2000, 2200, 2400];

  it("accepts any price when no prices are known", () => {
    expect(isImplausiblePrice(299000, [])).toBe(false);
  });

  it("accepts a price close to the median", () => {
    expect(isImplausiblePrice(2500, known)).toBe(false);
  });

  it("flags a typo far above the median", () => {
    expect(isImplausiblePrice(299000, known)).toBe(true);
  });

  it("flags a price far below the median", () => {
    expect(isImplausiblePrice(500, known)).toBe(true);
  });

  it("accepts exactly 3x and 1/3 of the median", () => {
    expect(isImplausiblePrice(6600, [2200])).toBe(false);
    expect(isImplausiblePrice(600, [1800])).toBe(false);
  });

  it("flags just beyond 3x and 1/3", () => {
    expect(isImplausiblePrice(6601, [2200])).toBe(true);
    expect(isImplausiblePrice(599, [1800])).toBe(true);
  });
});
