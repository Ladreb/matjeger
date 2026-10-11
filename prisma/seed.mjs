import { PrismaClient } from "@prisma/client";

if (process.env.ENABLE_DEV_TOOLS !== "true") {
  console.error("Refusing to seed: ENABLE_DEV_TOOLS is not true (set it in .env.development.local).");
  process.exit(1);
}

const db = new PrismaClient();
const POSTAL_CODE = "0150";
const DAY_MS = 24 * 60 * 60 * 1000;

// 200 is the GS1 prefix for in-store numbers, which are never assigned to real products.
const products = [
  { barcode: "2000000000011", name: "Lettmelk 1 l", brand: "Tine", volumeMl: 1000 },
  { barcode: "2000000000028", name: "Kaffe filtermalt 250 g", brand: "Friele", weightG: 250 },
  { barcode: "2000000000035", name: "Havregryn 750 g", brand: "Axa", weightG: 750 },
  { barcode: "2000000000042", name: "Brød grovt 750 g", brand: "Bakeriet", weightG: 750 },
  { barcode: "2000000000059", name: "Egg 12 stk", brand: "Prior", weightG: 660 },
  { barcode: "2000000000066", name: "Smør 250 g", brand: "Meierismør", weightG: 250 },
  { barcode: "2000000000073", name: "Pasta penne 500 g", brand: "Barilla", weightG: 500 },
  { barcode: "2000000000080", name: "Eplejuice 1 l", brand: "Sunniva", volumeMl: 1000 },
  { barcode: "2000000000097", name: "Ost norvegia 1 kg", brand: "Tine", weightG: 1000 },
  { barcode: "2000000000103", name: "Produkt uten pris", brand: "Testmerke" },
];

// [product index, store, price in øre, age in days]
const reports = [
  [0, "REMA_1000", 2190, 1],
  [0, "KIWI", 2290, 3],
  [0, "MENY", 2590, 45],
  [1, "KIWI", 5990, 2],
  [1, "SPAR", 6490, 10],
  [2, "REMA_1000", 2990, 0],
  [2, "COOP_EXTRA", 2790, 31],
  [3, "BUNNPRIS", 3990, 5],
  [3, "REMA_1000", 3490, 6],
  [4, "KIWI", 4290, 4],
  [4, "COOP_PRIX", 4490, 29],
  [5, "REMA_1000", 4990, 12],
  [6, "KIWI", 1990, 7],
  [6, "MENY", 2490, 60],
  [7, "ODA", 3290, 2],
  [8, "COOP_OBS", 14900, 8],
];

const saved = [];
for (const product of products) {
  saved.push(
    await db.product.upsert({
      where: { barcode: product.barcode },
      update: {},
      create: product,
    }),
  );
}

await db.priceReport.deleteMany({
  where: { productId: { in: saved.map((p) => p.id) } },
});
await db.priceReport.createMany({
  data: reports.map(([index, store, price, ageDays]) => ({
    productId: saved[index].id,
    store,
    price,
    postalCode: POSTAL_CODE,
    reportedAt: new Date(Date.now() - ageDays * DAY_MS),
  })),
});

console.log(`Seeded ${saved.length} products and ${reports.length} price reports for ${POSTAL_CODE}.`);
await db.$disconnect();
