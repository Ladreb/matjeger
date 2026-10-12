import { describe, expect, it } from "vitest";
import {
  hashScanner,
  norwegianDay,
  recordUnknownBarcode,
  type UnknownBarcodeStore,
} from "./unknown-barcodes";

function fakeStore() {
  const scanners = new Set<string>();
  const counts = new Map<
    string,
    { count: number; firstSeenAt: Date; lastSeenAt: Date }
  >();
  const store: UnknownBarcodeStore = {
    async rememberScanner({ barcode, day, scannerHash }) {
      const key = [barcode, day, scannerHash].join("|");
      if (scanners.has(key)) return false;
      scanners.add(key);
      return true;
    },
    async countScan(barcode, now) {
      const row = counts.get(barcode);
      counts.set(
        barcode,
        row
          ? { ...row, count: row.count + 1, lastSeenAt: now }
          : { count: 1, firstSeenAt: now, lastSeenAt: now },
      );
    },
    async forgetScannersBefore(day) {
      for (const key of scanners) {
        if (key.split("|")[1] < day) scanners.delete(key);
      }
    },
  };
  return { store, scanners, counts };
}

const secret = "test-secret";
const morning = new Date("2026-10-12T08:00:00Z");
const evening = new Date("2026-10-12T18:00:00Z");
const nextDay = new Date("2026-10-13T08:00:00Z");

function scan(
  store: UnknownBarcodeStore,
  userId: string,
  now: Date,
  barcode = "7038010000001",
) {
  return recordUnknownBarcode(store, { barcode, userId, secret, now });
}

describe("recordUnknownBarcode", () => {
  it("creates a row with count 1 on the first scan", async () => {
    const { store, counts } = fakeStore();
    await scan(store, "u1", morning);
    expect(counts.get("7038010000001")).toEqual({
      count: 1,
      firstSeenAt: morning,
      lastSeenAt: morning,
    });
  });

  it("counts different users and keeps the first seen time", async () => {
    const { store, counts } = fakeStore();
    await scan(store, "u1", morning);
    await scan(store, "u2", evening);
    expect(counts.get("7038010000001")).toEqual({
      count: 2,
      firstSeenAt: morning,
      lastSeenAt: evening,
    });
  });

  it("counts a user once per barcode and day", async () => {
    const { store, counts } = fakeStore();
    await scan(store, "u1", morning);
    await scan(store, "u1", evening);
    expect(counts.get("7038010000001")?.count).toBe(1);
  });

  it("counts the same user again the next day", async () => {
    const { store, counts } = fakeStore();
    await scan(store, "u1", morning);
    await scan(store, "u1", nextDay);
    expect(counts.get("7038010000001")?.count).toBe(2);
  });

  it("counts the same user on another barcode", async () => {
    const { store, counts } = fakeStore();
    await scan(store, "u1", morning, "7038010000001");
    await scan(store, "u1", morning, "7038010000002");
    expect(counts.size).toBe(2);
  });

  it("forgets scanners from earlier days and stores no user id", async () => {
    const { store, scanners } = fakeStore();
    await scan(store, "u1", morning);
    await scan(store, "u2", nextDay);
    expect(scanners.size).toBe(1);
    expect([...scanners].join()).not.toContain("u2");
  });
});

describe("norwegianDay", () => {
  it("uses the Norwegian date, not UTC", () => {
    expect(norwegianDay(new Date("2026-10-12T22:30:00Z"))).toBe("2026-10-13");
  });
});

describe("hashScanner", () => {
  it("is stable per user and secret, and differs otherwise", () => {
    expect(hashScanner("u1", "a")).toBe(hashScanner("u1", "a"));
    expect(hashScanner("u1", "a")).not.toBe(hashScanner("u2", "a"));
    expect(hashScanner("u1", "a")).not.toBe(hashScanner("u1", "b"));
  });
});
