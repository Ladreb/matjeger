import { describe, expect, it } from "vitest";
import { formatStaleAge, isStale } from "./staleness";

const NOW = new Date("2026-10-11T12:00:00Z");

describe("isStale", () => {
  it("is stale from 31 days, not at 30", () => {
    expect(isStale(new Date("2026-09-11T12:00:00Z"), NOW)).toBe(false);
    expect(isStale(new Date("2026-09-10T12:00:00Z"), NOW)).toBe(true);
  });
});

describe("formatStaleAge", () => {
  it("says how many days ago the price was reported", () => {
    expect(formatStaleAge(new Date("2026-08-27T12:00:00Z"), NOW)).toBe(
      "Gammel pris, rapportert for 45 dager siden",
    );
  });
});
