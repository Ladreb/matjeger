import { describe, expect, it } from "vitest";
import { findCheapest } from "./cheapest";

describe("findCheapest", () => {
  it("returns null without prices", () => {
    expect(findCheapest([])).toBeNull();
  });

  it("returns the lowest price with its chain", () => {
    expect(
      findCheapest([
        { store: "KIWI", price: 2290 },
        { store: "REMA_1000", price: 2190 },
        { store: "MENY", price: 2490 },
      ]),
    ).toEqual({ store: "REMA_1000", price: 2190 });
  });
});
