"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { PageColumn } from "@/components/page-column";
import { PostalCodeForm } from "./postal-code-form";

// Stays mounted after the first save so "Lagret" is seen; hides on the next navigation.
export function PostalCodePrompt({
  hasPostalCode,
}: {
  hasPostalCode: boolean;
}) {
  const pathname = usePathname();
  const [savedOnPath, setSavedOnPath] = useState<string | null>(null);
  if (savedOnPath !== null && savedOnPath !== pathname) setSavedOnPath(null);
  const justSaved = savedOnPath === pathname;

  if (hasPostalCode && !justSaved) return null;

  return (
    <PageColumn width="default">
      <div className="flex flex-col gap-3 rounded-lg border p-4">
        <p className="font-semibold">Hvor handler du?</p>
        <p className="text-sm text-muted-foreground">
          Prisene varierer, så vi bruker postnummeret ditt når du rapporterer og
          sammenligner priser.
        </p>
        <PostalCodeForm onSaved={() => setSavedOnPath(pathname)} />
      </div>
    </PageColumn>
  );
}
