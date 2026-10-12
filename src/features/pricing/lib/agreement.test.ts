import { describe, expect, it } from "vitest";
import { countAgreeingReporters } from "./agreement";

const report = (
  id: string,
  store: "KIWI" | "REMA_1000",
  price: number,
  reportedById: string | null,
) => ({ id, store, price, reportedById });

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
});
