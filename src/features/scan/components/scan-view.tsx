"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { PageColumn } from "@/components/page-column";
import { Button } from "@/components/ui/button";
import type { Store } from "@prisma/client";
import { priceAreaOf } from "@/features/location/lib/price-area";
import { cheapestAfterReport } from "@/features/pricing/lib/cheapest";
import { formatStaleAge, isStale } from "@/features/pricing/lib/staleness";
import { ReportPriceForm } from "@/features/pricing/components/report-price-form";
import { AddToListButton } from "@/features/shopping-list/components/add-to-list-button";
import { cheapestPriceLabel } from "@/features/search/lib/results";
import {
  lookupBarcode,
  type LookupResult,
  type ScannedProduct,
} from "../lib/actions";
import { BarcodeScanner } from "./barcode-scanner";
import { ManualBarcodeForm } from "./manual-barcode-form";

type Outcome = { barcode: string; result: LookupResult };

export function ScanView({ canCreateProducts }: { canCreateProducts: boolean }) {
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [cameraAvailable, setCameraAvailable] = useState(true);
  const [pending, startTransition] = useTransition();

  function lookup(barcode: string) {
    startTransition(async () => {
      try {
        setOutcome({ barcode, result: await lookupBarcode(barcode) });
      } catch {
        setOutcome({
          barcode,
          result: { ok: false, error: "Noe gikk galt. Prøv igjen." },
        });
      }
    });
  }

  const showScanner = cameraAvailable && !outcome && !pending;

  return (
    <PageColumn width="narrow" className="flex flex-1 flex-col gap-4">
      {showScanner && (
        <BarcodeScanner
          onScan={lookup}
          onCameraUnavailable={() => setCameraAvailable(false)}
        />
      )}
      {!cameraAvailable && !outcome && (
        <p className="text-sm text-muted-foreground">
          Kameraet er ikke tilgjengelig. Skriv inn strekkoden under.
        </p>
      )}
      {pending && <p className="text-muted-foreground">Slår opp ...</p>}
      {outcome && !pending && (
        <>
          <OutcomeMessage outcome={outcome} canCreateProducts={canCreateProducts} />
          <Button
            variant="outline"
            className="sm:w-fit"
            onClick={() => setOutcome(null)}
          >
            Skann ny
          </Button>
        </>
      )}
      <ManualBarcodeForm onSubmit={lookup} disabled={pending} />
    </PageColumn>
  );
}

function OutcomeMessage({
  outcome,
  canCreateProducts,
}: {
  outcome: Outcome;
  canCreateProducts: boolean;
}) {
  const { barcode, result } = outcome;
  if (!result.ok) {
    return <p className="text-destructive">{result.error}</p>;
  }
  if (!result.product) {
    return (
      <div className="flex flex-col gap-3">
        <p>
          Fant ikke produktet med strekkode {barcode}. Takk, vi har notert
          den.
        </p>
        {canCreateProducts && (
          <Button asChild className="h-11 sm:w-fit">
            <Link href={`/admin/products/new?barcode=${barcode}`}>
              Opprett produkt
            </Link>
          </Button>
        )}
        <Button asChild variant="outline" className="h-11 sm:w-fit">
          <Link href="/search">Søk etter navn</Link>
        </Button>
      </div>
    );
  }
  return (
    <ScannedProductCard product={result.product} postalCode={result.postalCode} />
  );
}

function ScannedProductCard({
  product,
  postalCode,
}: {
  product: ScannedProduct;
  postalCode: string | null;
}) {
  const [reporting, setReporting] = useState(false);
  const [cheapest, setCheapest] = useState(product.cheapest);
  const priceLabel = cheapest
    ? cheapestPriceLabel(cheapest.price, cheapest.store, cheapest.areaLabel)
    : null;

  function updateCheapest(store: Store, price: number) {
    setCheapest(cheapestAfterReport(cheapest, store, price, new Date()));
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-3">
      <div>
        <p className="font-medium">{product.name}</p>
        {product.brand && (
          <p className="text-sm text-muted-foreground">{product.brand}</p>
        )}
      </div>
      {priceLabel && cheapest ? (
        <div>
          <p className="text-lg font-semibold">{priceLabel}</p>
          {isStale(cheapest.reportedAt) && (
            <p className="text-sm text-amber-700 dark:text-amber-400">
              {formatStaleAge(cheapest.reportedAt)}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {postalCode ? (
            `Ingen priser for postnummer ${postalCode} eller ${priceAreaOf(postalCode).label} ennå.`
          ) : (
            <>
              <Link href="/profile" className="underline">
                Lagre postnummeret ditt
              </Link>{" "}
              for å se priser.
            </>
          )}
        </p>
      )}
      <AddToListButton
        productId={product.id}
        productName={product.name}
        initialOnList={product.onList}
        showLabel
      />
      {reporting ? (
        <ReportPriceForm
          productId={product.id}
          onReported={updateCheapest}
          autoFocusPrice
        />
      ) : (
        <Button
          type="button"
          variant="outline"
          className="h-11 sm:w-fit"
          onClick={() => setReporting(true)}
        >
          Rapporter pris
        </Button>
      )}
      <Link
        href={`/products/${product.id}`}
        className="text-sm text-primary underline"
      >
        Se alle priser
      </Link>
    </div>
  );
}
