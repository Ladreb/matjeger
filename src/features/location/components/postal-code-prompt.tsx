"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { PostalCodeForm } from "./postal-code-form";

// Stays mounted after the first save so "Lagret" is seen; hides on the next navigation.
export function PostalCodePrompt({
  hasPostalCode,
}: {
  hasPostalCode: boolean;
}) {
  const pathname = usePathname();
  const [savedOnPath, setSavedOnPath] = useState<string | null>(null);
  const justSaved = savedOnPath === pathname;

  if (hasPostalCode && !justSaved) return null;

  return (
    <div className="m-4 flex flex-col gap-3 rounded-lg border p-4">
      <p className="font-semibold">Hvor handler du?</p>
      <p className="text-sm text-muted-foreground">
        Prisene varierer, så vi bruker postnummeret ditt når du rapporterer og
        sammenligner priser.
      </p>
      <PostalCodeForm onSaved={() => setSavedOnPath(pathname)} />
    </div>
  );
}
