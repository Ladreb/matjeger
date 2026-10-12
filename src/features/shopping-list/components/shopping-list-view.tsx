"use client";

import { ChevronRight, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { PageColumn } from "@/components/page-column";
import { Button } from "@/components/ui/button";
import { STORE_LABELS } from "@/features/pricing/lib/stores";
import { formatPrice } from "@/lib/utils";
import {
  clearCheckedItems,
  removeItem,
  restoreItems,
  setChecked,
  setQuantity,
  type ListActionResult,
} from "../lib/actions";
import {
  computePlans,
  maxSaving,
  VISIBLE_PLAN_COUNT,
  type StorePrice,
} from "../lib/plans";
import { clampQuantity } from "../lib/quantity";
import { countItems, describeSaving, describeStalePrices } from "../lib/wording";
import type { ListItemData } from "../types/shopping-list";
import { PlanCard } from "./plan-card";
import { ShoppingListItem } from "./shopping-list-item";

type Props = {
  initialItems: ListItemData[];
  prices: StorePrice[];
  postalCode: string | null;
  now: Date;
};

type SavedValues = { quantity: number; checked: boolean };

const UNDO_SECONDS = 6;
const SAVE_FAILED = "Kunne ikke lagre endringen. Prøv igjen.";
const FAILED: ListActionResult = { ok: false, message: SAVE_FAILED };

function byAddedOrder(a: ListItemData, b: ListItemData) {
  return a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id);
}

function confirmedValues(items: ListItemData[]) {
  return new Map<string, SavedValues>(
    items.map((item) => [
      item.id,
      { quantity: item.quantity, checked: item.checked },
    ]),
  );
}

export function ShoppingListView({ initialItems, prices, postalCode, now }: Props) {
  const [items, setItems] = useState(initialItems);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [clearFailed, setClearFailed] = useState(false);
  const [confirmed, setConfirmed] = useState(() => confirmedValues(initialItems));
  const [unfinishedChanges, setUnfinishedChanges] = useState(0);
  const [undoFailed, setUndoFailed] = useState(false);
  const [showAllPlans, setShowAllPlans] = useState(false);
  const [seenInitialItems, setSeenInitialItems] = useState(initialItems);
  const [undoable, setUndoable] = useState<{
    removed: ListItemData[];
    message: string;
  } | null>(null);

  // Fresh server data (an add from another page, or a late refresh) replaces the screen, unless a change of ours is still saving, since the server has not seen it yet.
  if (seenInitialItems !== initialItems) {
    setSeenInitialItems(initialItems);
    if (unfinishedChanges === 0) {
      setItems(initialItems);
      setConfirmed(confirmedValues(initialItems));
    }
  }
  const unfinishedSaves = useRef(new Map<string, number>());
  const heading = useRef<HTMLHeadingElement>(null);
  const focusHeadingAfterRender = useRef(false);

  useEffect(() => {
    if (!undoable) return;
    const timer = setTimeout(() => setUndoable(null), UNDO_SECONDS * 1000);
    return () => clearTimeout(timer);
  }, [undoable]);

  useEffect(() => {
    if (focusHeadingAfterRender.current) {
      focusHeadingAfterRender.current = false;
      heading.current?.focus();
    }
  }, [items]);

  const { plans, unpricedProductIds } = useMemo(
    () =>
      computePlans(
        items.map(({ productId, quantity }) => ({ productId, quantity })),
        prices,
        now,
      ),
    [items, prices, now],
  );

  const itemsByProductId = useMemo(
    () => new Map(items.map((item) => [item.productId, item])),
    [items],
  );
  const pricedProductIds = useMemo(
    () => new Set(prices.map((price) => price.productId)),
    [prices],
  );

  function updateItem(id: string, changes: Partial<SavedValues>) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    );
  }

  function setError(id: string, message: string | null) {
    setErrors((current) => {
      const rest = { ...current };
      delete rest[id];
      return message ? { ...rest, [id]: message } : rest;
    });
  }

  // Only the last unfinished save of a field may undo the screen, so fast taps do not fight each other.
  async function save<Field extends keyof SavedValues>(
    id: string,
    field: Field,
    value: SavedValues[Field],
    send: () => Promise<ListActionResult>,
  ) {
    const key = `${id}:${field}`;
    setUnfinishedChanges((count) => count + 1);
    updateItem(id, { [field]: value });
    setError(id, null);
    unfinishedSaves.current.set(key, (unfinishedSaves.current.get(key) ?? 0) + 1);

    const result = await send().catch(() => FAILED);
    setUnfinishedChanges((count) => count - 1);

    const remaining = (unfinishedSaves.current.get(key) ?? 1) - 1;
    unfinishedSaves.current.set(key, remaining);
    const saved = confirmed.get(id);
    if (result.ok) {
      if (saved) saved[field] = value;
      if (remaining === 0) setError(id, null);
      return;
    }
    setError(id, SAVE_FAILED);
    if (remaining === 0 && saved) updateItem(id, { [field]: saved[field] });
  }

  function restore(removed: ListItemData[]) {
    setItems((current) => [...current, ...removed].sort(byAddedOrder));
  }

  async function remove(item: ListItemData) {
    setItems((current) => current.filter((other) => other.id !== item.id));
    setUndoable(null);
    focusHeadingAfterRender.current = true;
    setUnfinishedChanges((count) => count + 1);
    const result = await removeItem(item.id).catch(() => FAILED);
    setUnfinishedChanges((count) => count - 1);
    if (!result.ok) {
      restore([item]);
      setError(item.id, SAVE_FAILED);
      return;
    }
    setUndoable({ removed: [item], message: `«${item.name}» er fjernet` });
  }

  async function undoRemoval() {
    if (!undoable) return;
    const { removed } = undoable;
    setUndoable(null);
    setUndoFailed(false);
    restore(removed);
    setUnfinishedChanges((count) => count + 1);
    const result = await restoreItems(removed).catch(() => FAILED);
    setUnfinishedChanges((count) => count - 1);
    if (!result.ok) {
      const restoredIds = new Set(removed.map((item) => item.id));
      setItems((current) => current.filter((item) => !restoredIds.has(item.id)));
      setUndoFailed(true);
    }
  }

  async function clearMarked() {
    const removed = items.filter((item) => item.checked);
    setItems((current) => current.filter((item) => !item.checked));
    focusHeadingAfterRender.current = true;
    setClearFailed(false);
    setUndoable(null);
    setUnfinishedChanges((count) => count + 1);
    const result = await clearCheckedItems().catch(() => FAILED);
    setUnfinishedChanges((count) => count - 1);
    if (!result.ok) {
      restore(removed);
      setClearFailed(true);
      return;
    }
    setUndoable({ removed, message: `${countItems(removed.length)} er fjernet` });
  }

  const undoBar = undoable && (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-40 flex justify-center px-4 lg:bottom-6">
      <div
        role="status"
        className="pointer-events-auto flex w-full max-w-md items-center justify-between gap-2 rounded-lg bg-foreground py-1 pl-4 pr-1 text-sm text-background shadow-lg"
      >
        <span>{undoable.message}</span>
        <Button
          type="button"
          variant="ghost"
          className="h-11 px-4 text-background hover:bg-background/15 hover:text-background"
          onClick={() => void undoRemoval()}
        >
          Angre
        </Button>
      </div>
    </div>
  );

  if (items.length === 0) {
    return (
      <PageColumn
        width="default"
        className="flex flex-col items-center gap-3 px-4 py-12 text-center"
      >
        <ShoppingCart aria-hidden className="size-10 text-muted-foreground" />
        <h1 ref={heading} tabIndex={-1} className="text-xl font-semibold">
          Handlelisten er tom
        </h1>
        <p className="text-muted-foreground">
          Legg til varer fra søket eller fra en produktside, så finner vi
          billigste butikk.
        </p>
        <Button asChild className="h-11">
          <Link href="/search">Søk etter varer</Link>
        </Button>
        <Button asChild variant="ghost" className="h-11">
          <Link href="/scan">Skann en vare</Link>
        </Button>
        {undoBar}
      </PageColumn>
    );
  }

  const markedCount = items.filter((item) => item.checked).length;
  const cheapest = plans[0];
  const cheapestIsComplete = cheapest?.uncoveredProductIds.length === 0;
  const saving = cheapestIsComplete ? maxSaving(plans) : null;
  const shownPlans = showAllPlans ? plans : plans.slice(0, VISIBLE_PLAN_COUNT);

  return (
    <PageColumn width="default" className="flex flex-col gap-4 p-4">
      <div>
        <h1 ref={heading} tabIndex={-1} className="text-xl font-semibold">
          Handlelisten
        </h1>
        <p className="text-sm text-muted-foreground">{countItems(items.length)}</p>
      </div>

      {postalCode && cheapest && (
        <a
          href="#billigste-butikk"
          className="flex items-center justify-between gap-2 rounded-lg bg-secondary p-3 text-sm"
        >
          <span className="flex flex-col">
            <span>
              {cheapestIsComplete ? "Billigst" : "Færrest varer mangler"}:{" "}
              <b>{STORE_LABELS[cheapest.stops[0].store]}</b>,{" "}
              {!cheapestIsComplete && "fra "}
              {formatPrice(cheapest.total)}
            </span>
            <span className="text-muted-foreground">
              Se sammenligning
              {cheapest.stops.length > 1 && ` · ${cheapest.stops.length} stopp`}
            </span>
            {saving !== null && (
              <span className="font-medium text-green-700 dark:text-green-400">
                {describeSaving(saving)}
              </span>
            )}
            {cheapest.staleLineCount > 0 && (
              <span className="text-amber-700 dark:text-amber-400">
                {describeStalePrices(cheapest.staleLineCount)}
              </span>
            )}
          </span>
          <ChevronRight aria-hidden className="size-4" />
        </a>
      )}

      {undoFailed && (
        <p role="alert" className="text-sm text-destructive">
          Kunne ikke angre. Legg varen til på nytt.
        </p>
      )}

      <ul className="flex flex-col divide-y rounded-lg border">
        {items.map((item) => (
          <ShoppingListItem
            key={item.id}
            item={item}
            noPriceInPostalCode={
              postalCode && !pricedProductIds.has(item.productId)
                ? postalCode
                : null
            }
            error={errors[item.id]}
            onQuantityChange={(quantity) => {
              const next = clampQuantity(quantity);
              void save(item.id, "quantity", next, () => setQuantity(item.id, next));
            }}
            onCheckedChange={(checked) =>
              void save(item.id, "checked", checked, () => setChecked(item.id, checked))
            }
            onRemove={() => void remove(item)}
          />
        ))}
      </ul>

      {markedCount > 0 && (
        <div className="flex flex-col gap-1">
          <Button
            type="button"
            variant="outline"
            className="h-11 sm:w-fit"
            onClick={() => void clearMarked()}
          >
            Fjern markerte varer fra listen ({markedCount})
          </Button>
          {clearFailed && (
            <p role="alert" className="text-sm text-destructive">
              {SAVE_FAILED}
            </p>
          )}
        </div>
      )}

      <section id="billigste-butikk" className="flex scroll-mt-16 flex-col gap-3">
        <div>
          <h2 className="text-lg font-semibold">Billigste butikk</h2>
          {postalCode && (
            <p className="text-sm text-muted-foreground">
              Priser for postnummer {postalCode}
            </p>
          )}
        </div>

        {!postalCode && (
          <p className="text-sm text-muted-foreground">
            Lagre postnummeret ditt ovenfor for å se hvilken butikk som er
            billigst.
          </p>
        )}

        {postalCode && plans.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Ingen har rapportert priser for varene på listen i {postalCode} ennå.
            Åpne en vare og rapporter prisen,{" "}
            <Link href="/search" className="underline">
              søk etter andre varer
            </Link>{" "}
            eller{" "}
            <Link href="/profile" className="underline">
              endre postnummer
            </Link>
            .
          </p>
        )}

        {postalCode &&
          shownPlans.map((plan, index) => (
            <PlanCard
              key={plan.stops
                .map((stop) => `${stop.store}:${stop.lines.map((l) => l.productId)}`)
                .join("|")}
              plan={plan}
              rank={index + 1}
              isCheapest={index === 0 && cheapestIsComplete}
              saving={index === 0 ? saving : null}
              open={index === 0}
              now={now}
              itemsByProductId={itemsByProductId}
            />
          ))}

        {postalCode && plans.length > shownPlans.length && (
          <Button
            type="button"
            variant="outline"
            className="h-11 sm:w-fit"
            onClick={() => setShowAllPlans(true)}
          >
            Vis alle ({plans.length})
          </Button>
        )}

        {postalCode && plans.length > 0 && unpricedProductIds.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Ingen pris ennå, ikke med i sammenligningen:{" "}
            {unpricedProductIds
              .map((productId) => itemsByProductId.get(productId)?.name)
              .join(", ")}
            .
          </p>
        )}
      </section>
      {undoBar}
    </PageColumn>
  );
}
