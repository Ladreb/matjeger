"use client";

import Link from "next/link";
import { useState } from "react";
import type { Store } from "@prisma/client";
import type { RecentReport } from "../lib/agreement";
import { describeMissingStores } from "../lib/missing-stores";
import { LatestPrices } from "./latest-prices";
import { ReportPriceForm } from "./report-price-form";

type LatestPrice = {
  id: string;
  store: Store;
  price: number;
  reportedAt: Date;
  areaLabel: string | null;
};

export function ProductPrices({
  productId,
  postalCode,
  prices,
  recentReports,
}: {
  productId: string;
  postalCode: string;
  prices: LatestPrice[];
  recentReports: RecentReport[];
}) {
  const [updatedStore, setUpdatedStore] = useState<Store | null>(null);
  const onlyAreaPrices = prices.length > 0 && prices.every((p) => p.areaLabel !== null);

  const missingStoresLine =
    prices.length > 0 ? describeMissingStores(prices.map((p) => p.store)) : null;

  return (
    <>
      <section className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-medium">
            {onlyAreaPrices ? `Priser fra ${prices[0].areaLabel}` : `Priser i ${postalCode}`}
          </h2>
          <Link
            href="/profile"
            className="flex min-h-11 items-center text-sm text-primary underline"
          >
            Endre
          </Link>
        </div>
        {onlyAreaPrices && (
          <p className="text-sm text-muted-foreground">
            Ingen har rapportert pris for postnummer {postalCode} ennå. Prisene
            under er fra andre postnummer i nærheten.
          </p>
        )}
        <LatestPrices
          prices={prices}
          recentReports={recentReports}
          postalCode={postalCode}
          highlightedStore={updatedStore}
        />
        {missingStoresLine && (
          <p className="text-sm text-muted-foreground">
            {missingStoresLine} Vet du prisen? Rapporter den under.
          </p>
        )}
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="font-medium">Fant du en annen pris?</h2>
        <ReportPriceForm productId={productId} onReported={setUpdatedStore} />
      </section>
    </>
  );
}
