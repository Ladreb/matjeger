import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { STORES, STORE_LABELS } from "@/features/pricing/lib/stores";
import { STALE_AFTER_DAYS } from "@/features/pricing/lib/staleness";
import { cn, formatPrice } from "@/lib/utils";
import {
  dashboardHref,
  formatReportAge,
  isBarcodeSearch,
  pageRange,
  type DashboardParams,
} from "../lib/dashboard";
import type { DashboardPage, DashboardProduct } from "../lib/dashboard-queries";

type Props = {
  params: DashboardParams;
  data: DashboardPage;
  catalogueIsEmpty: boolean;
};

export function DashboardProducts({ params, data, catalogueIsEmpty }: Props) {
  if (data.products.length === 0) {
    return <EmptyState params={params} catalogueIsEmpty={catalogueIsEmpty} />;
  }

  const range = pageRange(params.page, data.total);
  return (
    <>
      <ProductTable products={data.products} />
      <ProductCards products={data.products} />
      <nav
        aria-label="Sider"
        className="flex flex-wrap items-center justify-between gap-2 text-sm"
      >
        <p className="text-muted-foreground">
          Viser {range.from} til {range.to} av {data.total}
        </p>
        <div className="flex gap-2">
          {range.hasPrevious && (
            <Button asChild variant="outline">
              <Link href={dashboardHref({ ...params, page: params.page - 1 })}>
                Forrige
              </Link>
            </Button>
          )}
          {range.hasNext && (
            <Button asChild variant="outline">
              <Link href={dashboardHref({ ...params, page: params.page + 1 })}>
                Neste
              </Link>
            </Button>
          )}
        </div>
      </nav>
    </>
  );
}

function EmptyState({
  params,
  catalogueIsEmpty,
}: {
  params: DashboardParams;
  catalogueIsEmpty: boolean;
}) {
  const clearHref = dashboardHref({});

  if (catalogueIsEmpty) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-muted-foreground">Ingen produkter ennå.</p>
        <Button asChild>
          <Link href="/admin/products/new">Nytt produkt</Link>
        </Button>
      </div>
    );
  }

  if (params.page > 1) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-muted-foreground">Ingen flere treff.</p>
        <Link href={dashboardHref({ ...params, page: 1 })} className="text-sm underline">
          Tilbake til første side
        </Link>
      </div>
    );
  }

  if (!params.query && params.filter === "no-prices") {
    return <GoodNews>Alle produkter har pris. Bra jobbet.</GoodNews>;
  }
  if (!params.query && params.filter === "old-prices") {
    return <GoodNews>Alle priser er ferske.</GoodNews>;
  }
  if (!params.query && params.filter === "no-brand") {
    return <GoodNews>Alle produkter har merke.</GoodNews>;
  }

  if (isBarcodeSearch(params.query)) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-muted-foreground">
          Fant ingen produkt med strekkode {params.query}.
        </p>
        <Button asChild>
          <Link href={`/admin/products/new?barcode=${params.query}`}>
            Opprett produkt
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-muted-foreground">
        {params.query ? `Ingen treff for «${params.query}».` : "Ingen treff."}
      </p>
      <Link href={clearHref} className="text-sm underline">
        Fjern filter
      </Link>
    </div>
  );
}

function GoodNews({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground">{children}</p>;
}

function barcodeOrPlu(product: DashboardProduct) {
  return product.barcode ?? product.pluCode ?? "";
}

function editHref(product: DashboardProduct) {
  return `/admin/products/${product.id}`;
}

function StaleAge({ ageDays }: { ageDays: number }) {
  const stale = ageDays > STALE_AFTER_DAYS;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        stale && "text-amber-700 dark:text-amber-400",
      )}
    >
      {stale && <TriangleAlert className="size-3.5" aria-label="Gammel pris" />}
      {formatReportAge(ageDays)}
    </span>
  );
}

function ProductTable({ products }: { products: DashboardProduct[] }) {
  return (
    <table className="hidden w-full text-sm lg:table">
      <thead className="text-left text-muted-foreground">
        <tr className="border-b">
          <th className="py-2 pr-4 font-medium">Produkt</th>
          <th className="py-2 pr-4 font-medium">Strekkode / PLU</th>
          <th className="py-2 pr-4 font-medium">Kjeder</th>
          <th className="py-2 pr-4 font-medium">Billigst</th>
          <th className="py-2 pr-4 font-medium">Siste rapport</th>
          <th className="py-2">
            <span className="sr-only">Handlinger</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id} className="relative border-b hover:bg-accent">
            <td className="max-w-64 py-2 pr-4">
              <Link
                href={editHref(product)}
                className="block truncate font-medium after:absolute after:inset-0"
              >
                {product.name}
              </Link>
              <span className="block truncate text-muted-foreground">
                {product.brand?.trim() || "Mangler merke"}
              </span>
            </td>
            <td className="py-2 pr-4 font-mono text-muted-foreground">
              {barcodeOrPlu(product)}
            </td>
            <td className="py-2 pr-4">
              {product.chains > 0 ? (
                `${product.chains} av ${STORES.length}`
              ) : (
                <span className="text-muted-foreground">Ingen priser</span>
              )}
            </td>
            <td className="py-2 pr-4">
              {product.cheapestPrice !== null && product.cheapestStore ? (
                <Link
                  href={`${editHref(product)}#prisrapporter`}
                  className="relative underline-offset-2 hover:underline"
                >
                  {formatPrice(product.cheapestPrice)}, {STORE_LABELS[product.cheapestStore]}
                </Link>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </td>
            <td className="py-2 pr-4">
              {product.ageDays !== null ? (
                <StaleAge ageDays={product.ageDays} />
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </td>
            <td className="py-2 text-right">
              <span className="text-muted-foreground">Rediger</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ProductCards({ products }: { products: DashboardProduct[] }) {
  return (
    <ul className="flex flex-col divide-y rounded-lg border lg:hidden">
      {products.map((product) => (
        <li key={product.id}>
          <Link
            href={editHref(product)}
            className="flex min-h-11 flex-col px-4 py-3 hover:bg-accent"
          >
            <span className="font-medium">{product.name}</span>
            <span className="text-sm text-muted-foreground">
              {[product.brand?.trim() || "Mangler merke", barcodeOrPlu(product)]
                .filter(Boolean)
                .join(" · ")}
            </span>
            <CardSummary product={product} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function CardSummary({ product }: { product: DashboardProduct }) {
  if (product.chains === 0) {
    return (
      <span className="mt-1 w-fit rounded-full bg-muted px-2 py-0.5 text-xs">
        Uten priser
      </span>
    );
  }
  return (
    <span className="flex flex-wrap items-center gap-x-1 text-sm">
      <span>
        {product.chains} {product.chains === 1 ? "kjede" : "kjeder"}
      </span>
      {product.cheapestPrice !== null && (
        <span>· fra {formatPrice(product.cheapestPrice)}</span>
      )}
      {product.ageDays !== null && (
        <>
          <span>·</span>
          <StaleAge ageDays={product.ageDays} />
          {product.ageDays > 1 && <span>siden</span>}
        </>
      )}
    </span>
  );
}
