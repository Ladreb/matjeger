"use client";

import { useState, useTransition } from "react";
import type { Store } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { reportPrice, type ReportPriceResult } from "../lib/actions";
import { STORES, STORE_LABELS } from "../lib/stores";

export function ReportPriceForm({
  productId,
  onReported,
}: {
  productId: string;
  onReported: (store: Store) => void;
}) {
  const [store, setStore] = useState("");
  const [price, setPrice] = useState("");
  const [result, setResult] = useState<ReportPriceResult | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(confirmed: boolean) {
    setResult(null);
    startTransition(async () => {
      const outcome = await reportPrice(productId, { store, price, confirmed });
      setResult(outcome);
      if (outcome.status === "saved") {
        setStore("");
        setPrice("");
        onReported(outcome.store);
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
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Butikkjede
        <select
          name="store"
          required
          value={store}
          onChange={(event) => {
            setStore(event.target.value);
            setResult(null);
          }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="" disabled>
            Velg butikkjede
          </option>
          {STORES.map((option) => (
            <option key={option} value={option}>
              {STORE_LABELS[option]}
            </option>
          ))}
        </select>
      </label>
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
