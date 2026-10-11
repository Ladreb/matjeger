export default function ProductLoading() {
  return (
    <div className="flex animate-pulse flex-col gap-6 p-4" aria-busy="true">
      <div className="flex flex-col gap-2">
        <div className="h-7 w-2/3 rounded bg-muted" />
        <div className="h-4 w-1/3 rounded bg-muted" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-5 w-1/3 rounded bg-muted" />
        <div className="h-32 rounded-lg bg-muted" />
      </div>
    </div>
  );
}
