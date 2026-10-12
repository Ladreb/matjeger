import { getServerSession } from "next-auth";
import Link from "next/link";
import { PageColumn } from "@/components/page-column";
import { SearchBox } from "@/components/search-box";
import { authOptions } from "@/features/auth/lib/auth";
import { priceAreaOf } from "@/features/location/lib/price-area";
import { searchProducts } from "@/features/products/lib/queries";
import { AddToListButton } from "@/features/shopping-list/components/add-to-list-button";
import { cheapestPriceLabel, splitByMatch } from "../lib/results";

export async function SearchView({ query }: { query: string }) {
  const session = query ? await getServerSession(authOptions) : null;
  const products =
    query && session
      ? await searchProducts(query, session.user.id, session.user.postalCode)
      : null;

  const postalCode = session?.user.postalCode;
  const areaLabel = postalCode ? priceAreaOf(postalCode).label : null;

  return (
    <PageColumn width="default" className="flex flex-col gap-4">
      <SearchBox
        initialQuery={query}
        path="/search"
        placeholder="Søk etter navn eller merke"
        label="Søk etter produkter"
      />

      {products?.length === 0 && (
        <p className="text-muted-foreground">
          Fant ingen produkter for «{query}».
        </p>
      )}

      {!query && (
        <p className="text-muted-foreground">
          Søk etter vare, for eksempel melk
        </p>
      )}

      {products && products.length > 0 && (
        <SearchResultGroups products={products} areaLabel={areaLabel} />
      )}
    </PageColumn>
  );
}

type SearchResults = Awaited<ReturnType<typeof searchProducts>>;

function SearchResultGroups({
  products,
  areaLabel,
}: {
  products: SearchResults;
  areaLabel: string | null;
}) {
  const { matches, similar } = splitByMatch(products);
  return (
    <>
      {matches.length > 0 && <ResultList areaLabel={areaLabel} products={matches} />}
      {similar.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-muted-foreground">
            Lignende treff
          </h2>
          <ResultList areaLabel={areaLabel} products={similar} />
        </section>
      )}
    </>
  );
}

function ResultList({
  products,
  areaLabel,
}: {
  products: SearchResults;
  areaLabel: string | null;
}) {
  return (
    <ul className="flex flex-col divide-y rounded-lg border">
      {products.map((product) => {
        const priceLabel = cheapestPriceLabel(
          product.cheapestPrice,
          product.cheapestStore,
          product.cheapestIsNearby ? areaLabel : null,
        );
        return (
          <li key={product.id} className="flex flex-wrap items-center">
            <Link
              href={`/products/${product.id}`}
              className="flex min-w-0 flex-1 flex-col px-4 py-3 hover:bg-accent"
            >
              <span className="font-medium">{product.name}</span>
              {product.brand && (
                <span className="text-sm text-muted-foreground">
                  {product.brand}
                </span>
              )}
              {priceLabel && <span className="text-sm">{priceLabel}</span>}
            </Link>
            <AddToListButton
              productId={product.id}
              productName={product.name}
              initialOnList={product.onList}
            />
          </li>
        );
      })}
    </ul>
  );
}
