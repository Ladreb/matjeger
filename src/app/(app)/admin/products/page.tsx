import Link from "next/link";
import { PageColumn } from "@/components/page-column";
import { SearchBox } from "@/components/search-box";
import { Button } from "@/components/ui/button";
import { requireCatalogueEditor } from "@/features/auth/lib/require-catalogue-editor";
import { DashboardFilters } from "@/features/products/components/dashboard-filters";
import { DashboardProducts } from "@/features/products/components/dashboard-products";
import { DashboardTabs } from "@/features/products/components/dashboard-tabs";
import { UnknownBarcodeRow } from "@/features/products/components/unknown-barcode-row";
import { parseDashboardParams } from "@/features/products/lib/dashboard";
import {
  countDashboardFilters,
  countUnknownBarcodes,
  listDashboardProducts,
  listUnknownBarcodes,
} from "@/features/products/lib/dashboard-queries";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // The layout guard runs in parallel with this page, so the page must check too or the data is streamed to a USER before the 404.
  await requireCatalogueEditor();
  const params = parseDashboardParams(await searchParams);
  const unknownBarcodeCount = await countUnknownBarcodes();

  return (
    <PageColumn width="wide" className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Produkter</h1>
        <Button asChild>
          <Link href="/admin/products/new">Nytt produkt</Link>
        </Button>
      </div>

      <DashboardTabs
        active={params.tab}
        unknownBarcodeCount={unknownBarcodeCount}
      />

      {params.tab === "unknown" ? (
        <UnknownBarcodes />
      ) : (
        <ProductsTab params={params} />
      )}
    </PageColumn>
  );
}

async function ProductsTab({
  params,
}: {
  params: ReturnType<typeof parseDashboardParams>;
}) {
  const [data, counts] = await Promise.all([
    listDashboardProducts(params.query, params.filter, params.page),
    countDashboardFilters(),
  ]);

  return (
    <>
      <SearchBox
        initialQuery={params.query}
        path="/admin/products"
        placeholder="Navn, merke eller strekkode"
        label="Søk etter produkter"
        keepParams={params.filter === "all" ? {} : { filter: params.filter }}
      />
      <DashboardFilters
        active={params.filter}
        query={params.query}
        counts={counts}
      />
      <DashboardProducts
        params={params}
        data={data}
        catalogueIsEmpty={counts.all === 0}
      />
    </>
  );
}

async function UnknownBarcodes() {
  const barcodes = await listUnknownBarcodes();

  if (barcodes.length === 0) {
    return (
      <p className="text-muted-foreground">
        Ingen ukjente strekkoder. Når noen skanner en vare vi ikke har, dukker
        den opp her.
      </p>
    );
  }

  return (
    <ul className="flex flex-col divide-y rounded-lg border">
      {barcodes.map((scan) => (
        <UnknownBarcodeRow
          key={scan.barcode}
          barcode={scan.barcode}
          count={scan.count}
          lastSeenDays={scan.lastSeenDays}
        />
      ))}
    </ul>
  );
}
