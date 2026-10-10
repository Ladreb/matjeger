"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isValidBarcode } from "@/features/products/lib/barcode";

export function ManualBarcodeForm({
  onSubmit,
  disabled,
}: {
  onSubmit: (barcode: string) => void;
  disabled: boolean;
}) {
  const [value, setValue] = useState("");

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(value);
      }}
    >
      <Input
        inputMode="numeric"
        maxLength={14}
        aria-label="Strekkode"
        placeholder="Skriv inn strekkode"
        value={value}
        onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
      />
      <Button type="submit" disabled={disabled || !isValidBarcode(value)}>
        Søk
      </Button>
    </form>
  );
}
