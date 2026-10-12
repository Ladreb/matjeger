"use client";

import { useState, useTransition } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { postalCodeFromPosition, savePostalCode } from "../lib/actions";

export function PostalCodeForm({
  initial,
  onSaved,
}: {
  initial?: string | null;
  onSaved?: () => void;
}) {
  const [value, setValue] = useState(initial ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await savePostalCode(value);
      if (result.ok) {
        setSaved(true);
        onSaved?.();
      } else setError(result.error);
    });
  }

  function useMyLocation() {
    setError(null);
    setSaved(false);
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
          if (result.ok) {
            setValue(result.postalCode);
            setSaved(true);
            onSaved?.();
          } else setError(result.error);
        }),
      () => setError("Fikk ikke tilgang til posisjonen din"),
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        variant="outline"
        className="sm:w-fit"
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
          onChange={(e) => {
            setValue(e.target.value.replace(/\D/g, ""));
            setSaved(false);
          }}
        />
        <Button type="submit" disabled={pending}>
          Lagre
        </Button>
      </form>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {saved && (
        <p role="status" className="text-sm text-muted-foreground">
          Lagret
        </p>
      )}
    </div>
  );
}
