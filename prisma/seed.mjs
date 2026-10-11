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
  { barcode: "2000000000015", name: "Lettmelk 1 l", brand: "Tine", volumeMl: 1000, description: "meieri, drikke" },
  { barcode: "2000000000022", name: "Kaffe filtermalt 250 g", brand: "Friele", weightG: 250 },
  { barcode: "2000000000039", name: "Havregryn 750 g", brand: "Axa", weightG: 750 },
  { barcode: "2000000000046", name: "Brød grovt 750 g", brand: "Bakeriet", weightG: 750 },
  { barcode: "2000000000053", name: "Egg 12 stk", brand: "Prior", weightG: 660 },
  { barcode: "2000000000060", name: "Smør 250 g", brand: "Meierismør", weightG: 250 },
  { barcode: "2000000000077", name: "Pasta penne 500 g", brand: "Barilla", weightG: 500 },
  { barcode: "2000000000084", name: "Eplejuice 1 l", brand: "Sunniva", volumeMl: 1000 },
  { barcode: "2000000000091", name: "Ost norvegia 1 kg", brand: "Tine", weightG: 1000 },
  { barcode: "2000000000107", name: "Produkt uten pris", brand: "Testmerke" },
  { barcode: "2000000000114", name: "Is vanilje 1 l", brand: "Hennig-Olsen", volumeMl: 1000, description: "iskrem, dessert" },
  { barcode: "2000000000121", name: "Ål røkt 300 g", brand: "Fjordfisk", weightG: 300, description: "fisk" },
  { barcode: "2000000000138", name: "Te earl grey 25 poser", brand: "Twinings", weightG: 50 },
  { barcode: "2000000000145", name: "Øl pils 0,5 l", brand: "Ringnes", volumeMl: 500, description: "drikke, alkohol" },
  { barcode: "2000000000152", name: "Løk gul 1 kg", brand: "Gartnerhallen", weightG: 1000 },
  { barcode: "2000000000169", name: "Kål hvit 1 stk", brand: "Gartnerhallen", weightG: 1200 },
  { barcode: "2000000000176", name: "Mel hvete 2 kg", brand: "Regal", weightG: 2000 },
  { barcode: "2000000000183", name: "Ris jasmin 1 kg", brand: "Tilda", weightG: 1000, description: "korn, gryn" },
  { barcode: "2000000000190", name: "Andebryst 400 g", brand: "Gilde", weightG: 400 },
  { barcode: "2000000000206", name: "Kavring 500 g", brand: "Brandt", weightG: 500 },
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
      update: { description: product.description },
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
