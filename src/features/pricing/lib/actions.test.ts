import { beforeEach, describe, expect, it, vi } from "vitest";

const update = vi.fn();
const requireCatalogueEditor = vi.fn();
vi.mock("@/lib/db", () => ({ db: { priceReport: { update } } }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/features/auth/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/features/auth/lib/require-catalogue-editor", () => ({
  requireCatalogueEditor,
}));

const { hideReport } = await import("./actions");

beforeEach(() => {
  update.mockReset();
  requireCatalogueEditor.mockReset();
});

describe("hideReport", () => {
  it("records the admin who hid the report", async () => {
    requireCatalogueEditor.mockResolvedValue({ user: { id: "admin1" } });
    update.mockResolvedValue({ productId: "p1" });
    await hideReport("r1");
    expect(update.mock.calls[0][0].where).toEqual({ id: "r1" });
    expect(update.mock.calls[0][0].data.hiddenById).toBe("admin1");
  });

  it("does not touch the database without catalogue access", async () => {
    requireCatalogueEditor.mockRejectedValue(new Error("NEXT_NOT_FOUND"));
    await expect(hideReport("r1")).rejects.toThrow();
    expect(update).not.toHaveBeenCalled();
  });
});
