import type { Store } from "@prisma/client";
import { daysSince } from "@/features/pricing/lib/staleness";

export type AdminPriceReport = {
  id: string;
  store: Store;
  price: number;
  perKg: boolean;
  postalCode: string;
  reporterName: string | null;
  ageDays: number;
  hidden: boolean;
};

type ReportRow = {
  id: string;
  store: Store;
  price: number;
  priceUnit: "PER_UNIT" | "PER_KG";
  postalCode: string;
  reportedAt: Date;
  hiddenAt: Date | null;
  reportedBy: { name: string | null } | null;
};

export function toAdminPriceReport(row: ReportRow, now: Date): AdminPriceReport {
  return {
    id: row.id,
    store: row.store,
    price: row.price,
    perKg: row.priceUnit === "PER_KG",
    postalCode: row.postalCode,
    reporterName: row.reportedBy?.name ?? null,
    ageDays: daysSince(row.reportedAt, now),
    hidden: row.hiddenAt !== null,
  };
}
