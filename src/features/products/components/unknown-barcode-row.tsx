"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  formatLastSeen,
  formatScanCount,
} from "../lib/dashboard";
import {
  dismissUnknownBarcode,
  restoreUnknownBarcode,
} from "../lib/actions";

type Props = {
  barcode: string;
  count: number;
  lastSeenDays: number;
};

export function UnknownBarcodeRow({ barcode, count, lastSeenDays }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  function change(action: (barcode: string) => Promise<void>, dismiss: boolean) {
    setFailed(false);
    startTransition(async () => {
      try {
        await action(barcode);
        setDismissed(dismiss);
      } catch {
        setFailed(true);
      }
    });
  }

  return (
    <li className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col">
        <span
          className={
            dismissed
              ? "font-mono text-lg text-muted-foreground line-through"
              : "font-mono text-lg"
          }
        >
          {barcode}
        </span>
        <span className="text-sm text-muted-foreground">
          Skannet {formatScanCount(count)}, sist {formatLastSeen(lastSeenDays)}
        </span>
        {failed && (
          <span role="alert" className="text-sm text-destructive">
            Kunne ikke lagre. Prøv igjen.
          </span>
        )}
      </div>

      <div className="flex gap-2">
        {dismissed ? (
          <>
            <span role="status" className="self-center text-sm text-muted-foreground">
              Ignorert
            </span>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => change(restoreUnknownBarcode, false)}
            >
              Angre
            </Button>
          </>
        ) : (
          <>
            <Button asChild>
              <Link href={`/admin/products/new?barcode=${barcode}`}>
                Opprett produkt
              </Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={pending}
              onClick={() => change(dismissUnknownBarcode, true)}
            >
              Ignorer
            </Button>
          </>
        )}
      </div>
    </li>
  );
}
