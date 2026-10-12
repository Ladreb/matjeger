"use client";

import { useState, useTransition } from "react";
import type { Store } from "@prisma/client";
import { toggleFavouriteStore } from "../lib/actions";
import { STORES } from "../lib/stores";
import { StoreChipList } from "./store-chip-list";

export function FavouriteStoresForm({ initial }: { initial: Store[] }) {
  const [favourites, setFavourites] = useState(initial);
  const [pending, startTransition] = useTransition();

  function toggle(store: Store) {
    if (pending) return;
    const previous = favourites;
    setFavourites(
      previous.includes(store)
        ? previous.filter((s) => s !== store)
        : [...previous, store],
    );
    startTransition(async () => {
      const saved = await toggleFavouriteStore(store).catch(() => null);
      setFavourites(saved ?? previous);
    });
  }

  return (
    <StoreChipList
      labelledBy="favourite-stores-label"
      stores={STORES}
      selected={(store) => favourites.includes(store)}
      favourites={favourites}
      onSelect={toggle}
    />
  );
}
