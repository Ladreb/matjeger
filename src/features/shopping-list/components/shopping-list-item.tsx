import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MAX_QUANTITY, MIN_QUANTITY } from "../lib/quantity";
import type { ListItemData } from "../types/shopping-list";

type Props = {
  item: ListItemData;
  noPriceInPostalCode: string | null;
  error: string | undefined;
  onQuantityChange: (quantity: number) => void;
  onCheckedChange: (checked: boolean) => void;
  onRemove: () => void;
};

export function ShoppingListItem({
  item,
  noPriceInPostalCode,
  error,
  onQuantityChange,
  onCheckedChange,
  onRemove,
}: Props) {
  const label = `«${item.name}»`;

  return (
    <li className="flex flex-col px-1 py-1">
      <div className="flex items-center">
        <label className="flex size-11 shrink-0 cursor-pointer items-center justify-center">
          <input
            type="checkbox"
            checked={item.checked}
            onChange={(event) => onCheckedChange(event.target.checked)}
            aria-label={`Marker ${label}`}
            className="size-5 accent-primary"
          />
        </label>

        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col px-1",
            item.checked && "text-muted-foreground line-through",
          )}
        >
          <span>{item.name}</span>
          {item.brand && (
            <span className="text-sm text-muted-foreground">{item.brand}</span>
          )}
        </div>

        <div role="group" aria-label={`Antall ${label}`} className="flex items-center">
          <Button
            type="button"
            variant="outline"
            className="size-11"
            aria-label={`Færre ${label}`}
            disabled={item.quantity <= MIN_QUANTITY}
            onClick={() => onQuantityChange(item.quantity - 1)}
          >
            <Minus aria-hidden />
          </Button>
          <output aria-live="polite" className="w-8 text-center tabular-nums">
            {item.quantity}
          </output>
          <Button
            type="button"
            variant="outline"
            className="size-11"
            aria-label={`Flere ${label}`}
            disabled={item.quantity >= MAX_QUANTITY}
            onClick={() => onQuantityChange(item.quantity + 1)}
          >
            <Plus aria-hidden />
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          className="size-11"
          aria-label={`Fjern ${label} fra listen`}
          onClick={onRemove}
        >
          <Trash2 aria-hidden />
        </Button>
      </div>

      {noPriceInPostalCode && (
        <p className="px-12 text-sm text-muted-foreground">
          Ingen pris i {noPriceInPostalCode} ennå
        </p>
      )}
      {error && (
        <p role="alert" className="px-12 text-sm text-destructive">
          {error}
        </p>
      )}
    </li>
  );
}
