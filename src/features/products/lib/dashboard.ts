export const DASHBOARD_PAGE_SIZE = 50;
export const DASHBOARD_FILTERS = ["all", "no-prices", "old-prices", "no-brand"] as const;
export type DashboardFilter = (typeof DASHBOARD_FILTERS)[number];

export const DASHBOARD_FILTER_LABELS: Record<DashboardFilter, string> = {
  all: "Alle",
  "no-prices": "Uten priser",
  "old-prices": "Gamle priser",
  "no-brand": "Uten merke",
};

export type DashboardTab = "products" | "unknown";

export type DashboardParams = {
  tab: DashboardTab;
  query: string;
  filter: DashboardFilter;
  page: number;
};

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseDashboardParams(raw: RawParams): DashboardParams {
  const filter = first(raw.filter);
  const page = Number(first(raw.page));
  return {
    tab: first(raw.tab) === "unknown" ? "unknown" : "products",
    query: first(raw.q)?.trim() ?? "",
    filter: DASHBOARD_FILTERS.find((known) => known === filter) ?? "all",
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export function dashboardHref(params: Partial<DashboardParams>) {
  const search = new URLSearchParams();
  if (params.tab === "unknown") search.set("tab", "unknown");
  if (params.query) search.set("q", params.query);
  if (params.filter && params.filter !== "all") search.set("filter", params.filter);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  const query = search.toString();
  return query ? `/admin/products?${query}` : "/admin/products";
}

export function isBarcodeSearch(query: string) {
  return /^\d{8,}$/.test(query);
}

export function pageRange(page: number, total: number) {
  const from = total === 0 ? 0 : (page - 1) * DASHBOARD_PAGE_SIZE + 1;
  const to = Math.min(page * DASHBOARD_PAGE_SIZE, total);
  return { from, to, hasPrevious: page > 1, hasNext: to < total };
}

export function formatReportAge(days: number) {
  if (days === 0) return "i dag";
  if (days === 1) return "i går";
  return `${days} dager`;
}

export function formatLastSeen(days: number) {
  if (days === 0) return "i dag";
  if (days === 1) return "i går";
  return `for ${days} dager siden`;
}

export function formatScanCount(count: number) {
  return count === 1 ? "1 gang" : `${count} ganger`;
}
