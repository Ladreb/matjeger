"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { PageColumn } from "@/components/page-column";
import { Button } from "@/components/ui/button";
import { lookupBarcode, type LookupResult } from "../lib/actions";
import { BarcodeScanner } from "./barcode-scanner";
import { ManualBarcodeForm } from "./manual-barcode-form";

type Outcome = { barcode: string; result: LookupResult };

export function ScanView() {
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
    <PageColumn width="narrow" className="flex flex-1 flex-col gap-4 p-4">
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
          <OutcomeMessage outcome={outcome} />
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

function OutcomeMessage({ outcome }: { outcome: Outcome }) {
  const { barcode, result } = outcome;
  if (!result.ok) {
    return <p className="text-destructive">{result.error}</p>;
  }
  if (!result.product) {
    return (
      <p>
        Fant ikke produktet med strekkode {barcode}. Vi legger det til
        etter hvert.
      </p>
    );
  }
  return (
    <Link
      href={`/products/${result.product.id}`}
      className="block rounded-lg border p-3"
    >
      <p className="font-medium">{result.product.name}</p>
      {result.product.brand && (
        <p className="text-sm text-muted-foreground">{result.product.brand}</p>
      )}
      <p className="mt-1 text-sm text-primary">Se priser og rapporter</p>
    </Link>
  );
}
