import { cn } from "@/lib/utils";

const widths = {
  narrow: "max-w-xl",
  default: "max-w-2xl",
  wide: "max-w-5xl",
} as const;

export function PageColumn({
  width,
  className,
  ...props
}: React.ComponentProps<"div"> & { width: keyof typeof widths }) {
  return (
    <div className={cn("mx-auto w-full", widths[width], className)} {...props} />
  );
}
