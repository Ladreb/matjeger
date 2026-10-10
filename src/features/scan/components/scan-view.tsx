"use client";

import { useState, useTransition } from "react";
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
      setOutcome({ barcode, result: await lookupBarcode(barcode) });
    });
  }

  const showScanner = cameraAvailable && !outcome && !pending;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
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
          <Button variant="outline" onClick={() => setOutcome(null)}>
            Skann ny
          </Button>
        </>
      )}
      {!outcome && (
        <ManualBarcodeForm onSubmit={lookup} disabled={pending} />
      )}
    </div>
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
    <div>
      <p className="font-medium">{result.product.name}</p>
      {result.product.brand && (
        <p className="text-sm text-muted-foreground">{result.product.brand}</p>
      )}
    </div>
  );
}
