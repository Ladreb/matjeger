import { describe, expect, it } from "vitest";
import { toAdminPriceReport } from "./price-reports";

const row = {
  id: "r1",
  store: "KIWI" as const,
  price: 2990,
  priceUnit: "PER_UNIT" as const,
  postalCode: "0150",
  reportedAt: new Date("2026-10-01T12:00:00Z"),
  hiddenAt: null,
  reportedBy: { name: "Kari" },
};
const now = new Date("2026-10-04T12:00:00Z");

describe("toAdminPriceReport", () => {
  it("maps a visible report", () => {
    expect(toAdminPriceReport(row, now)).toMatchObject({
      hidden: false,
      reporterName: "Kari",
      ageDays: 3,
      perKg: false,
    });
  });

  it("marks hidden reports and handles a missing reporter", () => {
    const result = toAdminPriceReport(
      { ...row, hiddenAt: now, reportedBy: null },
      now,
    );
    expect(result.hidden).toBe(true);
    expect(result.reporterName).toBeNull();
  });
});
