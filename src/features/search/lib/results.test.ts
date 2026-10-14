import { describe, expect, it } from "vitest";
import { formatPrice } from "@/lib/utils";
import { cheapestPriceLabel, splitByMatch } from "./results";

describe("splitByMatch", () => {
  it("keeps the order inside each group", () => {
    const { matches, similar } = splitByMatch([
      { id: "a", isSimilarMatch: false },
      { id: "b", isSimilarMatch: true },
      { id: "c", isSimilarMatch: false },
      { id: "d", isSimilarMatch: true },
    ]);
    expect(matches.map((r) => r.id)).toEqual(["a", "c"]);
    expect(similar.map((r) => r.id)).toEqual(["b", "d"]);
  });

  it("returns empty groups for no results", () => {
    expect(splitByMatch([])).toEqual({ matches: [], similar: [] });
  });
});

describe("cheapestPriceLabel", () => {
  it("names the price and the store chain", () => {
    expect(cheapestPriceLabel(2190, "REMA_1000")).toBe(
      `fra ${formatPrice(2190)} hos Rema 1000`,
    );
  });

  it("says which area an area price is from", () => {
    expect(cheapestPriceLabel(2190, "REMA_1000", "01xx")).toBe(
      `fra ${formatPrice(2190)} hos Rema 1000 (pris fra 01xx)`,
    );
  });

  it("is empty when there is no price", () => {
    expect(cheapestPriceLabel(null, null)).toBeNull();
  });
});
