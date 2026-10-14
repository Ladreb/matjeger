import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";

let productId: string | undefined;

afterAll(async () => {
  if (productId) {
    await db.priceReport.deleteMany({ where: { productId } });
    await db.product.delete({ where: { id: productId } });
  }
  await db.$disconnect();
});

describe("test database", () => {
  it("stores a price report and reads it back", async () => {
    const product = await db.product.create({ data: { name: "Testmelk", barcode: "2000000000017" } });
    productId = product.id;
    await db.priceReport.create({
      data: { productId: product.id, store: "KIWI", postalCode: "0150", price: 2190 },
    });

    const reports = await db.priceReport.findMany({ where: { productId: product.id } });

    expect(reports).toHaveLength(1);
    expect(reports[0]).toMatchObject({ store: "KIWI", postalCode: "0150", price: 2190 });
  });

  it("is the throwaway database on this machine, whatever the .env files say", () => {
    expect(new URL(process.env.DATABASE_URL ?? "").hostname).toBe("127.0.0.1");
  });
});
