import { beforeEach, describe, expect, it, vi } from "vitest";

const findMany = vi.fn();
vi.mock("@/lib/db", () => ({ db: { priceReport: { findMany } } }));

const { findRecentReports } = await import("./queries");

beforeEach(() => {
  findMany.mockReset();
});

describe("findRecentReports", () => {
  it("includes hidden reports so an admin can show them again", async () => {
    await findRecentReports("p1");
    expect(findMany.mock.calls[0][0].where).toEqual({ productId: "p1" });
  });
});
