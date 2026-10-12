"use client";

import { useState } from "react";
import type { Store } from "@prisma/client";
import { isNearbyPrice, nearbyPricesLabel } from "@/features/location/lib/price-area";
import type { RecentReport } from "../lib/agreement";
import { LatestPrices } from "./latest-prices";
import { ReportPriceForm } from "./report-price-form";

type LatestPrice = {
  id: string;
  store: Store;
  price: number;
  reportedAt: Date;
  postalCode: string;
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
  const onlyNearbyPrices =
    prices.length > 0 && prices.every((p) => isNearbyPrice(p.postalCode, postalCode));

  return (
    <>
      <section className="flex flex-col gap-2">
        <h2 className="font-medium">
          {onlyNearbyPrices ? nearbyPricesLabel(postalCode) : `Priser i ${postalCode}`}
        </h2>
        {onlyNearbyPrices && (
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
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="font-medium">Rapporter pris</h2>
        <ReportPriceForm productId={productId} onReported={setUpdatedStore} />
      </section>
    </>
  );
}
