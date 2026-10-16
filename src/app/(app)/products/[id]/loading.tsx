import { PageColumn } from "@/components/page-column";

export default function ProductLoading() {
  return (
    <PageColumn
      width="wide"
      className="flex animate-pulse flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8"
    >
      <p role="status" className="sr-only">
        Laster…
      </p>
      <div className="flex flex-col gap-2">
        <div className="h-7 w-2/3 rounded bg-muted" />
        <div className="h-4 w-1/3 rounded bg-muted" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-5 w-1/3 rounded bg-muted" />
        <div className="h-32 rounded-lg bg-muted" />
      </div>
    </PageColumn>
  );
}
