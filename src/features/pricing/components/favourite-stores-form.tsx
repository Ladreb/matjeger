"use client";

import { useState, useTransition } from "react";
import type { Store } from "@prisma/client";
import { toggleFavouriteStore } from "../lib/actions";
import { STORES } from "../lib/stores";
import { StoreChipList } from "./store-chip-list";

export function FavouriteStoresForm({ initial }: { initial: Store[] }) {
  const [favourites, setFavourites] = useState(initial);
  const [, startTransition] = useTransition();

  function toggle(store: Store) {
    startTransition(async () => {
      setFavourites(await toggleFavouriteStore(store));
    });
  }

  return (
    <StoreChipList
      stores={STORES}
      selected={(store) => favourites.includes(store)}
      favourites={favourites}
      onSelect={toggle}
    />
  );
}
