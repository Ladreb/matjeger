"use client";

import { useState, useTransition } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { postalCodeFromPosition, savePostalCode } from "../lib/actions";

export function PostalCodeForm({ initial }: { initial?: string | null }) {
  const [value, setValue] = useState(initial ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await savePostalCode(value);
      if (!result.ok) setError(result.error);
    });
  }

  function useMyLocation() {
    setError(null);
    if (!navigator.geolocation) {
      setError("Nettleseren din støtter ikke posisjon");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        startTransition(async () => {
          const result = await postalCodeFromPosition(
            coords.latitude,
            coords.longitude,
          );
          if (result.ok) setValue(result.postalCode);
          else setError(result.error);
        }),
      () => setError("Fikk ikke tilgang til posisjonen din"),
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={useMyLocation}
        disabled={pending}
      >
        <MapPin /> Bruk posisjonen min
      </Button>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <Input
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={4}
          placeholder="Postnummer"
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
        />
        <Button type="submit" disabled={pending}>
          Lagre
        </Button>
      </form>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
