import type { Store } from "@prisma/client";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { STORE_LABELS } from "../lib/stores";

export function StoreChipList({
  stores,
  selected,
  favourites = [],
  onSelect,
  loading = false,
  labelledBy,
}: {
  stores: Store[];
  selected: (store: Store) => boolean;
  favourites?: Store[];
  onSelect: (store: Store) => void;
  loading?: boolean;
  labelledBy: string;
}) {
  if (loading) {
    return (
      <div className="flex flex-wrap gap-2" aria-busy="true">
        {stores.map((store) => (
          <div key={store} className="h-11 w-20 animate-pulse rounded-md bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div role="group" aria-labelledby={labelledBy} className="flex flex-wrap gap-2">
      {stores.map((store) => (
        <button
          key={store}
          type="button"
          aria-pressed={selected(store)}
          onClick={() => onSelect(store)}
          className={cn(
            "inline-flex h-11 items-center gap-1.5 rounded-md border px-3 text-sm font-medium",
            selected(store)
              ? "border-primary bg-primary text-primary-foreground"
              : "border-input bg-background",
          )}
        >
          {favourites.includes(store) && (
            <>
              <Star aria-hidden className="size-3.5 fill-current" />
              <span className="sr-only">Favoritt</span>
            </>
          )}
          {STORE_LABELS[store]}
        </button>
      ))}
    </div>
  );
}
