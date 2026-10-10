"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
        placeholder="Skriv inn strekkode"
        value={value}
        onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
      />
      <Button type="submit" disabled={disabled || !value}>
        Søk
      </Button>
    </form>
  );
}
