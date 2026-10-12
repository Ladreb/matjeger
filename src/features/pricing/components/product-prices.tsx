"use client";

import { useState } from "react";
import type { Store } from "@prisma/client";
import { LatestPrices } from "./latest-prices";
import { ReportPriceForm } from "./report-price-form";

type LatestPrice = { id: string; store: Store; price: number; reportedAt: Date };

export function ProductPrices({
  productId,
  postalCode,
  prices,
}: {
  productId: string;
  postalCode: string;
  prices: LatestPrice[];
}) {
  const [updatedStore, setUpdatedStore] = useState<Store | null>(null);

  return (
    <>
      <section className="flex flex-col gap-2">
        <h2 className="font-medium">Priser i {postalCode}</h2>
        <LatestPrices
          prices={prices}
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
