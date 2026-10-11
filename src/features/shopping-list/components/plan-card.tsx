import { ChevronDown, TriangleAlert } from "lucide-react";
import { STORE_LABELS } from "@/features/pricing/lib/stores";
import { formatStaleAge } from "@/features/pricing/lib/staleness";
import { cn, formatPrice } from "@/lib/utils";
import type { Plan } from "../lib/plans";
import { countItems } from "../lib/quantity";

type Props = {
  plan: Plan;
  rank: number;
  isCheapest: boolean;
  open: boolean;
  now: Date;
  itemsByProductId: Map<string, { name: string; quantity: number; checked: boolean }>;
};

export function PlanCard({
  plan,
  rank,
  isCheapest,
  open,
  now,
  itemsByProductId,
}: Props) {
  const storeNames = plan.stops.map((stop) => STORE_LABELS[stop.store]);
  const isPartial = plan.uncoveredProductIds.length > 0;
  const stopCount = plan.stops.length;
  const overview =
    stopCount === 1
      ? `Alt hos ${storeNames[0]} · 1 stopp`
      : `${storeNames.join(" og ")} · ${stopCount} stopp`;

  return (
    <details open={open} className="group rounded-lg border">
      <summary className="grid cursor-pointer list-none grid-cols-[28px_1fr_auto_20px] items-start gap-x-2 p-3 [&::-webkit-details-marker]:hidden">
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-full text-sm font-semibold",
            isCheapest
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground",
          )}
        >
          {rank}
        </span>
        <span className="flex flex-wrap items-center gap-2 font-semibold">
          {storeNames[0]}
          {isCheapest && (
            <span className="rounded-full bg-accent px-2 text-xs font-normal text-accent-foreground">
              Billigst
            </span>
          )}
        </span>
        <span className="font-semibold">
          {isPartial && "Fra "}
          {formatPrice(plan.total)}
        </span>
        <ChevronDown
          aria-hidden
          className="size-5 transition-transform group-open:rotate-180"
        />
        <span className="col-start-2 col-end-5 text-sm text-muted-foreground">
          {overview}
        </span>
        {plan.staleLineCount > 0 && (
          <span className="col-start-2 col-end-5 text-sm text-amber-700 dark:text-amber-400">
            {plan.staleLineCount === 1
              ? "Inkluderer 1 gammel pris"
              : `Inkluderer ${plan.staleLineCount} gamle priser`}
          </span>
        )}
        {isPartial && (
          <span className="col-start-2 col-end-5 flex items-start gap-1 text-sm text-amber-700 dark:text-amber-400">
            <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
            Mangler pris for {countItems(plan.uncoveredProductIds.length)}, totalen
            er minst {formatPrice(plan.total)}
          </span>
        )}
      </summary>

      <div className="flex flex-col gap-3 border-t p-3">
        {plan.stops.map((stop) => (
          <section key={stop.store} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between font-medium">
              <h3>Handle hos {STORE_LABELS[stop.store]}</h3>
              <span>{formatPrice(stop.total)}</span>
            </div>
            <ul className="flex flex-col gap-1">
              {stop.lines.map((line) => {
                const item = itemsByProductId.get(line.productId);
                return (
                  <li
                    key={line.productId}
                    className="flex flex-col text-sm"
                  >
                    <div
                      className={cn(
                        "flex justify-between gap-2",
                        item?.checked && "text-muted-foreground line-through",
                      )}
                    >
                      <span>
                        {line.quantity} × {item?.name}
                      </span>
                      <span>{formatPrice(line.lineTotal)}</span>
                    </div>
                    {line.isStale && (
                      <span className="text-amber-700 dark:text-amber-400">
                        {formatStaleAge(line.reportedAt, now)}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        {isPartial && (
          <section className="flex flex-col gap-1">
            <h3 className="font-medium">Mangler i denne planen</h3>
            <ul className="text-sm">
              {plan.uncoveredProductIds.map((productId) => (
                <li key={productId}>{itemsByProductId.get(productId)?.name}</li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground">
              Disse har pris i andre butikker, men ikke hos de to i denne planen.
            </p>
          </section>
        )}
      </div>
    </details>
  );
}
