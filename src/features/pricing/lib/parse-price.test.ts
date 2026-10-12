import { describe, expect, it } from "vitest";
import { parsePriceToOre } from "./parse-price";

describe("parsePriceToOre", () => {
  it("reads comma and dot as øre", () => {
    expect(parsePriceToOre("29,90")).toBe(2990);
    expect(parsePriceToOre("29.9")).toBe(2990);
  });

  it("returns 0 for zero so the caller can give its own message", () => {
    expect(parsePriceToOre("0")).toBe(0);
    expect(parsePriceToOre("0,00")).toBe(0);
  });

  it("rejects text", () => {
    expect(parsePriceToOre("abc")).toBeNull();
  });
});
