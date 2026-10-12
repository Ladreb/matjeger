import { beforeEach, describe, expect, it, vi } from "vitest";

const findMany = vi.fn();
const queryRaw = vi.fn();
vi.mock("@/lib/db", () => ({ db: { priceReport: { findMany }, $queryRaw: queryRaw } }));

const { findLatestPricesPerStore, findRecentReports, findRecentVisibleReports } = await import("./queries");

beforeEach(() => {
  findMany.mockReset();
  queryRaw.mockReset().mockResolvedValue([]);
});

describe("findLatestPricesPerStore", () => {
  it("ignores hidden reports so the previous visible report becomes the price", async () => {
    await findLatestPricesPerStore("p1", "0150");
    expect(queryRaw.mock.calls[0][0].sql).toContain('"hiddenAt" IS NULL');
  });

  it("looks in the postal code area and puts the own postal code first", async () => {
    await findLatestPricesPerStore("p1", "0151");
    const query = queryRaw.mock.calls[0][0];
    expect(query.sql).toContain('"postalCode" BETWEEN');
    expect(query.sql).toContain('"postalCode" = ?');
    expect(query.values).toEqual(expect.arrayContaining(["0100", "0199", "0151"]));
  });
});

describe("findLatestPricesPerStore ordering", () => {
  it("sorts the own postal code before newer area reports", async () => {
    await findLatestPricesPerStore("p1", "0151");
    const sql = queryRaw.mock.calls[0][0].sql.replace(/\s+/g, " ");
    const own = sql.indexOf('(r."postalCode" = ?) DESC');
    const newest = sql.indexOf('r."reportedAt" DESC');
    expect(sql).toContain("DISTINCT ON (r.store)");
    expect(sql).toContain("ORDER BY r.store, (r.\"postalCode\" = ?) DESC");
    expect(own).toBeGreaterThan(-1);
    expect(own).toBeLessThan(newest);
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
