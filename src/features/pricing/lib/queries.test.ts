import { beforeEach, describe, expect, it, vi } from "vitest";

const findMany = vi.fn();
vi.mock("@/lib/db", () => ({ db: { priceReport: { findMany } } }));

const { findLatestPricesPerStore, findRecentReports, findRecentVisibleReports } = await import("./queries");

beforeEach(() => findMany.mockReset());

describe("findLatestPricesPerStore", () => {
  it("ignores hidden reports so the previous visible report becomes the price", async () => {
    await findLatestPricesPerStore("p1", "0150");
    expect(findMany.mock.calls[0][0].where).toEqual({
      productId: "p1",
      postalCode: "0150",
      hiddenAt: null,
    });
  });
});

describe("findRecentVisibleReports", () => {
  it("ignores hidden reports and reports older than the staleness limit", async () => {
    await findRecentVisibleReports("p1", "0150", new Date("2026-10-31T00:00:00Z"));
    expect(findMany.mock.calls[0][0].where).toEqual({
      productId: "p1",
      postalCode: "0150",
      hiddenAt: null,
      reportedAt: { gte: new Date("2026-10-01T00:00:00Z") },
    });
  });
});

describe("findRecentReports", () => {
  it("includes hidden reports so an admin can show them again", async () => {
    await findRecentReports("p1");
    expect(findMany.mock.calls[0][0].where).toEqual({ productId: "p1" });
  });
});
