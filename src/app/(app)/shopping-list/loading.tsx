import { PageColumn } from "@/components/page-column";

export default function ShoppingListLoading() {
  return (
    <PageColumn
      width="wide"
      className="flex animate-pulse flex-col gap-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8"
    >
      <p role="status" className="sr-only">
        Laster…
      </p>
      <div className="h-7 w-1/2 rounded bg-muted lg:col-span-2" />
      <div className="h-11 rounded-lg bg-muted lg:hidden" />
      <div className="h-56 rounded-lg bg-muted" />
      <div className="flex flex-col gap-4">
        <div className="h-7 w-1/2 rounded bg-muted" />
        <div className="h-24 rounded-lg bg-muted" />
      </div>
    </PageColumn>
  );
}
