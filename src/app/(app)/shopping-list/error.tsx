"use client";

import { Button } from "@/components/ui/button";

export default function ShoppingListError({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-3 p-4 text-center">
      <p className="font-bold">Kunne ikke hente handlelisten.</p>
      <p className="text-muted-foreground">Sjekk nettforbindelsen og prøv igjen.</p>
      <Button variant="outline" onClick={reset}>
        Prøv igjen
      </Button>
    </div>
  );
}
