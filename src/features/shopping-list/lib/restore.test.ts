import { describe, expect, it } from "vitest";
import { parseRestoredItem } from "./restore";

const item = {
  id: "i1",
  productId: "p1",
  quantity: 3,
  checked: true,
  createdAt: "2026-10-01T10:00:00.000Z",
};

describe("parseRestoredItem", () => {
  it("keeps id, quantity, checked and the original date", () => {
    expect(parseRestoredItem(item)).toEqual({
      ...item,
      createdAt: new Date(item.createdAt),
    });
  });

  it("clamps the quantity", () => {
    expect(parseRestoredItem({ ...item, quantity: 500 })?.quantity).toBe(99);
    expect(parseRestoredItem({ ...item, quantity: -2 })?.quantity).toBe(1);
  });

  it("rejects a bad date, a fractional quantity or missing ids", () => {
    expect(parseRestoredItem({ ...item, createdAt: "nope" })).toBeNull();
    expect(parseRestoredItem({ ...item, quantity: 1.5 })).toBeNull();
    expect(parseRestoredItem({ ...item, id: "" })).toBeNull();
    expect(parseRestoredItem({ ...item, productId: "" })).toBeNull();
  });
});
