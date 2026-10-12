import { PageColumn } from "@/components/page-column";

export default function ShoppingListLoading() {
  return (
    <PageColumn
      width="default"
      className="flex animate-pulse flex-col gap-4"
    >
      <p role="status" className="sr-only">
        Laster…
      </p>
      <div className="h-7 w-1/2 rounded bg-muted" />
      <div className="h-11 rounded-lg bg-muted" />
      <div className="h-56 rounded-lg bg-muted" />
      <div className="h-7 w-1/2 rounded bg-muted" />
      <div className="h-24 rounded-lg bg-muted" />
    </PageColumn>
  );
}
