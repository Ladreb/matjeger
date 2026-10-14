import { describe, expect, it } from "vitest";
import { buildStorePreferences } from "./store-preferences";

const day = (n: number) => new Date(2026, 9, n);

describe("buildStorePreferences", () => {
  it("keeps the default order for a user without reports", () => {
    const result = buildStorePreferences([], []);
    expect(result.orderedStores[0]).toBe("REMA_1000");
    expect(result.orderedStores).toHaveLength(9);
    expect(result.lastUsedStore).toBeNull();
  });

  it("puts the most used store chains first", () => {
    const result = buildStorePreferences(
      [],
      [
        { store: "KIWI", reports: 2, lastReportedAt: day(3) },
        { store: "MENY", reports: 5, lastReportedAt: day(1) },
      ],
    );
    expect(result.orderedStores.slice(0, 3)).toEqual(["MENY", "KIWI", "REMA_1000"]);
  });

  it("puts favourites before more used store chains", () => {
    const result = buildStorePreferences(
      ["ODA"],
      [{ store: "MENY", reports: 5, lastReportedAt: day(1) }],
    );
    expect(result.orderedStores.slice(0, 2)).toEqual(["ODA", "MENY"]);
  });

  it("picks the store chain with the newest report as last used", () => {
    const result = buildStorePreferences(
      [],
      [
        { store: "MENY", reports: 5, lastReportedAt: day(1) },
        { store: "KIWI", reports: 1, lastReportedAt: day(9) },
      ],
    );
    expect(result.lastUsedStore).toBe("KIWI");
  });
});
