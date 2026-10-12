import { createHmac } from "node:crypto";
import { db } from "@/lib/db";

export type UnknownBarcodeStore = {
  rememberScanner(entry: {
    barcode: string;
    day: string;
    scannerHash: string;
  }): Promise<boolean>;
  countScan(barcode: string, now: Date): Promise<void>;
  forgetScannersBefore(day: string): Promise<void>;
};

export function norwegianDay(now: Date) {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(now);
}

// Keyed hash so the table cannot be linked back to a user without the secret.
export function hashScanner(userId: string, secret: string) {
  return createHmac("sha256", secret).update(userId).digest("hex");
}

export async function recordUnknownBarcode(
  store: UnknownBarcodeStore,
  input: { barcode: string; userId: string; secret: string; now: Date },
) {
  const day = norwegianDay(input.now);
  const isFirstScanToday = await store.rememberScanner({
    barcode: input.barcode,
    day,
    scannerHash: hashScanner(input.userId, input.secret),
  });
  if (!isFirstScanToday) return;
  await store.countScan(input.barcode, input.now);
  await store.forgetScannersBefore(day);
}

export const prismaUnknownBarcodeStore: UnknownBarcodeStore = {
  async rememberScanner(entry) {
    const { count } = await db.unknownBarcodeScanner.createMany({
      data: entry,
      skipDuplicates: true,
    });
    return count === 1;
  },
  async countScan(barcode, now) {
    await db.unknownBarcodeScan.upsert({
      where: { barcode },
      create: { barcode, firstSeenAt: now, lastSeenAt: now },
      update: { count: { increment: 1 }, lastSeenAt: now },
    });
  },
  async forgetScannersBefore(day) {
    await db.unknownBarcodeScanner.deleteMany({ where: { day: { lt: day } } });
  },
};
