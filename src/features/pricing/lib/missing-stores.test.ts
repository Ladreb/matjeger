import { describe, expect, it } from "vitest";
import { STORES } from "./stores";
import { describeMissingStores } from "./missing-stores";

describe("describeMissingStores", () => {
  it("names the first three chains and counts the rest", () => {
    expect(describeMissingStores(["KIWI"])).toBe(
      "Ingen pris ennå for Rema 1000, Spar, Meny og 5 til.",
    );
  });

  it("names every chain when three or fewer are missing", () => {
    const allButTwo = STORES.filter((s) => s !== "SPAR" && s !== "ODA");
    expect(describeMissingStores(allButTwo)).toBe("Ingen pris ennå for Spar og Oda.");
    const allButOne = STORES.filter((s) => s !== "ODA");
    expect(describeMissingStores(allButOne)).toBe("Ingen pris ennå for Oda.");
  });

  it("says nothing when every chain has a price", () => {
    expect(describeMissingStores(STORES)).toBeNull();
  });
});
