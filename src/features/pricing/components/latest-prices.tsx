import type { Store } from "@prisma/client";
import Link from "next/link";
import { isNearbyPrice, priceAreaOf } from "@/features/location/lib/price-area";
import { cn, formatPrice } from "@/lib/utils";
import { countAgreeingReporters, type RecentReport } from "../lib/agreement";
import { daysSince, isStale, STALE_AFTER_DAYS } from "../lib/staleness";
import { STORE_LABELS } from "../lib/stores";

type LatestPrice = {
  id: string;
  store: Store;
  price: number;
  reportedAt: Date;
  postalCode: string;
};

export function LatestPrices({
  prices,
  recentReports,
  postalCode,
  highlightedStore,
}: {
  prices: LatestPrice[];
  recentReports: RecentReport[];
  postalCode: string;
  highlightedStore: Store | null;
}) {
  if (prices.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Ingen har rapportert pris for postnummer {postalCode} eller{" "}
        {priceAreaOf(postalCode).label} ennå. Rapporter prisen under,{" "}
        <Link href="/search" className="underline">
          søk etter en annen vare
        </Link>{" "}
        eller{" "}
        <Link href="/profile" className="underline">
          endre postnummer
        </Link>
        .
      </p>
    );
  }

  const cheapestFirst = [...prices].sort((a, b) => a.price - b.price);
  const areaLabel = priceAreaOf(postalCode).label;

  return (
    <ul className="flex flex-col divide-y rounded-lg border">
      {cheapestFirst.map((report, index) => (
        <li
          key={report.id}
          className={cn(
            "flex flex-col gap-1 p-3",
            report.store === highlightedStore && "bg-primary/10",
          )}
        >
          <div className="flex items-baseline justify-between">
            <span className="flex items-center gap-2 font-medium">
              {STORE_LABELS[report.store]}
              {index === 0 && cheapestFirst.length > 1 && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                  Billigst
                </span>
              )}
            </span>
            <span className="font-semibold">{formatPrice(report.price)}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {report.store === highlightedStore
              ? "Oppdatert nå"
              : describeAge(report.reportedAt)}
          </p>
          {isNearbyPrice(report.postalCode, postalCode) ? (
            <p className="text-sm font-medium">Pris fra {areaLabel}</p>
          ) : (
            <AgreementNote
              count={countAgreeingReporters(report.store, report.price, recentReports)}
            />
          )}
          {isStale(report.reportedAt) && (
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Eldre enn {STALE_AFTER_DAYS} dager, prisen kan ha endret seg.
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

function AgreementNote({ count }: { count: number }) {
  if (count < 2) return null;
  return (
    <p className="text-sm text-muted-foreground">
      Samme pris rapportert av {count} brukere de siste {STALE_AFTER_DAYS} dagene
    </p>
  );
}

function describeAge(reportedAt: Date): string {
  const days = daysSince(reportedAt);
  if (days === 0) return "Rapportert i dag";
  if (days === 1) return "Rapportert for 1 dag siden";
  return `Rapportert for ${days} dager siden`;
}
