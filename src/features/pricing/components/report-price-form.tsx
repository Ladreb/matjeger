"use client";

import { useEffect, useState, useTransition } from "react";
import type { Store } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  loadStorePreferences,
  reportPrice,
  type ReportPriceResult,
} from "../lib/actions";
import { STORES } from "../lib/stores";
import type { StorePreferences } from "../lib/store-preferences";
import { StoreChipList } from "./store-chip-list";

export function ReportPriceForm({
  productId,
  onReported,
  autoFocusPrice = false,
}: {
  productId: string;
  onReported?: (store: Store, price: number) => void;
  autoFocusPrice?: boolean;
}) {
  const [store, setStore] = useState("");
  const [price, setPrice] = useState("");
  const [preferencesSettled, setPreferencesSettled] = useState(false);
  const [preferences, setPreferences] = useState<StorePreferences | null>(null);
  const [result, setResult] = useState<ReportPriceResult | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    loadStorePreferences()
      .then((loaded) => {
        if (!loaded) return;
        setPreferences(loaded);
        setStore((current) => current || loaded.lastUsedStore || "");
      })
      .catch(() => {})
      .finally(() => setPreferencesSettled(true));
  }, []);

  function submit(confirmed: boolean) {
    setResult(null);
    startTransition(async () => {
      const outcome = await reportPrice(productId, { store, price, confirmed });
      setResult(outcome);
      if (outcome.status === "saved") {
        setPrice("");
        onReported?.(outcome.store, outcome.price);
      }
    });
  }

  const needsConfirmation = result?.status === "needs-confirmation";

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit(false);
      }}
      className="flex flex-col gap-3"
    >
      <div className="flex flex-col gap-1.5">
        <span id="report-store-label" className="text-sm font-medium">Butikkjede</span>
        <StoreChipList
          labelledBy="report-store-label"
          loading={!preferencesSettled}
          stores={preferences?.orderedStores ?? STORES}
          selected={(option) => option === store}
          favourites={preferences?.favouriteStores}
          onSelect={(option) => {
            setStore(option);
            setResult(null);
          }}
        />
      </div>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Pris i kroner
        <Input
          name="price"
          inputMode="decimal"
          placeholder="29,90"
          value={price}
          onChange={(event) => {
            setPrice(event.target.value);
            setResult(null);
          }}
          required
          autoFocus={autoFocusPrice}
        />
      </label>
      <p
        role={result?.status === "error" ? "alert" : "status"}
        className={
          result?.status === "error"
            ? "text-sm text-destructive"
            : "text-sm text-muted-foreground"
        }
      >
        {result?.message}
      </p>
      {needsConfirmation ? (
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            className="sm:w-fit"
            disabled={pending}
            onClick={() => submit(true)}
          >
            {pending ? "Sender ..." : "Ja, rapporter prisen"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="sm:w-fit"
            disabled={pending}
            onClick={() => setResult(null)}
          >
            Endre pris
          </Button>
        </div>
      ) : (
        <Button type="submit" className="sm:w-fit" disabled={pending}>
          {pending ? "Sender ..." : "Rapporter pris"}
        </Button>
      )}
    </form>
  );
}
