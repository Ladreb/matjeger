import { describe, expect, it } from "vitest";
import {
  dashboardHref,
  formatLastSeen,
  formatReportAge,
  isBarcodeSearch,
  pageRange,
  parseDashboardParams,
} from "./dashboard";

describe("parseDashboardParams", () => {
  it("falls back to defaults for missing or bad values", () => {
    expect(
      parseDashboardParams({ tab: "x", filter: "nope", page: "-3", q: ["  a  ", "b"] }),
    ).toEqual({ tab: "products", query: "a", filter: "all", page: 1 });
    expect(parseDashboardParams({ page: "2.5" }).page).toBe(1);
  });

  it("reads valid values", () => {
    expect(
      parseDashboardParams({ tab: "unknown", filter: "old-prices", page: "3", q: "melk" }),
    ).toEqual({ tab: "unknown", query: "melk", filter: "old-prices", page: 3 });
  });
});

describe("dashboardHref", () => {
  it("leaves out defaults", () => {
    expect(dashboardHref({ tab: "products", filter: "all", page: 1 })).toBe("/admin/products");
  });

  it("keeps and encodes the rest", () => {
    expect(
      dashboardHref({ tab: "unknown" }),
    ).toBe("/admin/products?tab=unknown");
    expect(dashboardHref({ query: "lett melk", filter: "no-brand", page: 2 })).toBe(
      "/admin/products?q=lett+melk&filter=no-brand&page=2",
    );
  });
});

describe("isBarcodeSearch", () => {
  it("needs 8 or more digits and nothing else", () => {
    expect(isBarcodeSearch("7038010000")).toBe(true);
    expect(isBarcodeSearch("1234567")).toBe(false);
    expect(isBarcodeSearch("1234 5678")).toBe(false);
    expect(isBarcodeSearch("melk12345678")).toBe(false);
  });
});

describe("pageRange", () => {
  it("describes the first, a middle and the last page", () => {
    expect(pageRange(1, 212)).toEqual({ from: 1, to: 50, hasPrevious: false, hasNext: true });
    expect(pageRange(5, 212)).toEqual({ from: 201, to: 212, hasPrevious: true, hasNext: false });
    expect(pageRange(1, 50).hasNext).toBe(false);
  });

  it("handles no rows", () => {
    expect(pageRange(1, 0)).toEqual({ from: 0, to: 0, hasPrevious: false, hasNext: false });
  });
});

describe("ages", () => {
  it("uses today and yesterday before counting days", () => {
    expect(formatReportAge(0)).toBe("i dag");
    expect(formatReportAge(1)).toBe("i går");
    expect(formatReportAge(47)).toBe("47 dager");
    expect(formatLastSeen(4)).toBe("for 4 dager siden");
  });
});
