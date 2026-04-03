import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Convert øre (integer) to formatted NOK string, e.g. 2999 → "29,99 kr" */
export function formatPrice(ore: number): string {
  return (ore / 100).toLocaleString("nb-NO", {
    style: "currency",
    currency: "NOK",
    minimumFractionDigits: 2,
  });
}
