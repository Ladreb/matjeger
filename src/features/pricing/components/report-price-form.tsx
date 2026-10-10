"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { reportPrice } from "../lib/actions";
import { STORES, STORE_LABELS } from "../lib/stores";

export function ReportPriceForm({ productId }: { productId: string }) {
  const [state, formAction, pending] = useActionState(
    reportPrice.bind(null, productId),
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Butikkjede
        <select
          name="store"
          required
          defaultValue={state?.ok === false ? (state.values?.store ?? "") : ""}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="" disabled>
            Velg butikkjede
          </option>
          {STORES.map((store) => (
            <option key={store} value={store}>
              {STORE_LABELS[store]}
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
          defaultValue={state?.ok === false ? (state.values?.price ?? "") : ""}
          required
        />
      </label>
      {state && (
        <p
          role="status"
          className={
            state.ok ? "text-sm text-muted-foreground" : "text-sm text-destructive"
          }
        >
          {state.message}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Sender ..." : "Rapporter pris"}
      </Button>
    </form>
  );
}
