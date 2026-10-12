import type { Store } from "@prisma/client";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import { daysSince, isStale, STALE_AFTER_DAYS } from "../lib/staleness";
import { STORE_LABELS } from "../lib/stores";

type LatestPrice = {
  id: string;
  store: Store;
  price: number;
  reportedAt: Date;
};

export function LatestPrices({
  prices,
  postalCode,
  highlightedStore,
}: {
  prices: LatestPrice[];
  postalCode: string;
  highlightedStore: Store | null;
}) {
  if (prices.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Ingen har rapportert pris for postnummer {postalCode} ennå. Rapporter
        prisen under,{" "}
        <Link href="/search" className="underline">
          søke etter en annen vare
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

  return (
    <ul className="flex flex-col divide-y rounded-lg border">
      {cheapestFirst.map((report) => (
        <li
          key={report.id}
          className={cn(
            "flex flex-col gap-1 p-3",
            report.store === highlightedStore && "bg-primary/10",
          )}
        >
          <div className="flex items-baseline justify-between">
            <span className="font-medium">{STORE_LABELS[report.store]}</span>
            <span className="font-semibold">{formatPrice(report.price)}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {report.store === highlightedStore
              ? "Oppdatert nå"
              : describeAge(report.reportedAt)}
          </p>
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

function describeAge(reportedAt: Date): string {
  const days = daysSince(reportedAt);
  if (days === 0) return "Rapportert i dag";
  if (days === 1) return "Rapportert for 1 dag siden";
  return `Rapportert for ${days} dager siden`;
}
