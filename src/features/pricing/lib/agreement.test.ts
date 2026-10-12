import { describe, expect, it } from "vitest";
import { countAgreeingReporters } from "./agreement";

const report = (
  id: string,
  store: "KIWI" | "REMA_1000",
  price: number,
  reportedById: string | null,
  daysAgo = 0,
) => ({
  id,
  store,
  price,
  reportedById,
  reportedAt: new Date(Date.UTC(2026, 9, 12 - daysAgo)),
});

describe("countAgreeingReporters", () => {
  it("counts users who reported the same price for the chain", () => {
    const reports = [
      report("1", "KIWI", 2990, "a"),
      report("2", "KIWI", 2990, "b"),
      report("3", "KIWI", 3190, "c"),
    ];
    expect(countAgreeingReporters("KIWI", 2990, reports)).toBe(2);
  });

  it("counts a user once even if they reported the same price twice", () => {
    const reports = [
      report("1", "KIWI", 2990, "a"),
      report("2", "KIWI", 2990, "a"),
    ];
    expect(countAgreeingReporters("KIWI", 2990, reports)).toBe(1);
  });

  it("ignores other chains", () => {
    const reports = [report("1", "REMA_1000", 2990, "a")];
    expect(countAgreeingReporters("KIWI", 2990, reports)).toBe(0);
  });

  it("counts reports without a reporter separately", () => {
    const reports = [
      report("1", "KIWI", 2990, null),
      report("2", "KIWI", 2990, null),
    ];
    expect(countAgreeingReporters("KIWI", 2990, reports)).toBe(2);
  });

  it("does not count a user who later changed their price", () => {
    const reports = [
      report("1", "KIWI", 2990, "a", 5),
      report("2", "KIWI", 3190, "a", 1),
      report("3", "KIWI", 2990, "b", 0),
    ];
    expect(countAgreeingReporters("KIWI", 2990, reports)).toBe(1);
  });

  it("falls back to the earlier report when the newer one is left out", () => {
    const reports = [report("1", "KIWI", 2990, "a", 5)];
    expect(countAgreeingReporters("KIWI", 2990, reports)).toBe(1);
  });
});
