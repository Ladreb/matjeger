"use client";

import { Check, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { addToList, removeFromList } from "../lib/actions";

type Props = {
  productId: string;
  productName: string;
  initialOnList: boolean;
  showLabel?: boolean;
};

// Keeps its own state after a tap, so a late refresh of the page cannot flip it back.
export function AddToListButton({
  productId,
  productName,
  initialOnList,
  showLabel = false,
}: Props) {
  const [onList, setOnList] = useState(initialOnList);
  const [error, setError] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);

  async function add() {
    setError(null);
    setOnList(true);
    setJustAdded(true);
    const result = await addToList(productId).catch(() => ({ ok: false }));
    if (!result.ok) {
      setOnList(false);
      setJustAdded(false);
      setError("Kunne ikke legge til varen. Prøv igjen.");
    }
  }

  async function remove() {
    setError(null);
    setOnList(false);
    setJustAdded(false);
    const result = await removeFromList(productId).catch(() => ({ ok: false }));
    if (!result.ok) {
      setOnList(true);
      setError("Kunne ikke fjerne varen. Prøv igjen.");
    }
  }

  const errorText = error && (
    <p role="alert" className="basis-full px-4 pb-2 text-sm text-destructive">
      {error}
    </p>
  );

  if (!showLabel) {
    return (
      <>
        {onList ? (
          <Button
            type="button"
            variant="ghost"
            className="mr-1 size-11 text-primary"
            aria-label={`Fjern «${productName}» fra handlelisten`}
            onClick={remove}
          >
            <Check className="size-5" aria-hidden />
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            className="mr-1 size-11"
            aria-label={`Legg til «${productName}» på handlelisten`}
            onClick={add}
          >
            <Plus className="size-5" aria-hidden />
          </Button>
        )}
        <p
          role="status"
          className="basis-full px-4 pb-2 text-sm empty:hidden"
        >
          {justAdded && onList && (
            <>
              Lagt til.{" "}
              <Link href="/shopping-list" className="underline">
                Se listen
              </Link>
            </>
          )}
        </p>
        {errorText}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {onList ? (
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 font-medium">
            <Check className="size-4 text-primary" aria-hidden />
            På handlelisten
          </span>
          <Button asChild variant="outline" className="h-11">
            <Link href="/shopping-list">Se listen</Link>
          </Button>
          <Button type="button" variant="ghost" className="h-11" onClick={remove}>
            Fjern
          </Button>
        </div>
      ) : (
        <Button type="button" className="h-11 w-full sm:w-fit" onClick={add}>
          <Plus aria-hidden />
          Legg til på handlelisten
        </Button>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
