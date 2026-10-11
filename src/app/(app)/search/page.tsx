import { SearchView } from "@/features/search/components/search-view";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { q } = await searchParams;
  const query = Array.isArray(q) ? q[0] : q;
  return <SearchView query={query?.trim() ?? ""} />;
}
