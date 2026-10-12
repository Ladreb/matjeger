"use client";

import Link from "next/link";
import { useState } from "react";
import { ScanBarcode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarcodeScanner } from "@/features/scan/components/barcode-scanner";
import { findProductWithBarcode } from "../lib/actions";
import type { ExistingProduct } from "../lib/product-form-values";

type BarcodeFieldProps = {
  initialValue: string;
  productId?: string;
  existingProduct?: ExistingProduct;
};

export function BarcodeField({
  initialValue,
  productId,
  existingProduct,
}: BarcodeFieldProps) {
  const [value, setValue] = useState(initialValue);
  const [scanning, setScanning] = useState(false);
  const [cameraUnavailable, setCameraUnavailable] = useState(false);
  // undefined: show what the last save reported. null: the barcode changed since, so show nothing.
  const [duplicate, setDuplicate] = useState<ExistingProduct | null | undefined>(
    undefined,
  );
  const [lastSaveResult, setLastSaveResult] = useState(existingProduct);
  if (lastSaveResult !== existingProduct) {
    setLastSaveResult(existingProduct);
    setDuplicate(undefined);
  }
  const shownDuplicate = duplicate !== undefined ? duplicate : existingProduct;

  async function fillFromScan(barcode: string) {
    setValue(barcode);
    setScanning(false);
    setDuplicate(await findProductWithBarcode(barcode, productId));
  }

  return (
    <div className="flex flex-col gap-2">
      {scanning && (
        <BarcodeScanner
          onScan={fillFromScan}
          onCameraUnavailable={() => {
            setScanning(false);
            setCameraUnavailable(true);
          }}
        />
      )}
      {cameraUnavailable && (
        <p className="text-sm text-muted-foreground">
          Kamera er ikke tilgjengelig. Skriv inn strekkoden.
        </p>
      )}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="barcode" className="text-sm font-medium">
          Strekkode
        </label>
        <div className="flex gap-2">
          <Input
            id="barcode"
            className="h-11"
            name="barcode"
            inputMode="numeric"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setDuplicate(null);
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="h-11"
            onClick={() => {
              setCameraUnavailable(false);
              setScanning((open) => !open);
            }}
          >
            <ScanBarcode />
            {scanning ? "Lukk" : "Skann"}
          </Button>
        </div>
      </div>
      {shownDuplicate && (
        <p className="text-sm text-destructive">
          Finnes allerede:{" "}
          <Link
            href={`/admin/products/${shownDuplicate.id}`}
            className="underline"
          >
            {shownDuplicate.name}
          </Link>
        </p>
      )}
    </div>
  );
}
