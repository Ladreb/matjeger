import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  DASHBOARD_FILTERS,
  DASHBOARD_FILTER_LABELS,
  dashboardHref,
  type DashboardFilter,
} from "../lib/dashboard";
import type { FilterCounts } from "../lib/dashboard-queries";

type Props = {
  active: DashboardFilter;
  query: string;
  counts: FilterCounts;
};

export function DashboardFilters({ active, query, counts }: Props) {
  return (
    <nav
      aria-label="Filter"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
    >
      {DASHBOARD_FILTERS.map((filter) => (
        <Link
          key={filter}
          href={dashboardHref({ query, filter })}
          aria-current={filter === active ? "true" : undefined}
          className={cn(
            "flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm",
            filter === active
              ? "border-primary bg-primary text-primary-foreground"
              : "hover:bg-accent",
          )}
        >
          {DASHBOARD_FILTER_LABELS[filter]}
          <span className="tabular-nums opacity-70">{counts[filter]}</span>
        </Link>
      ))}
    </nav>
  );
}
