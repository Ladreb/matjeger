import Link from "next/link";
import { searchProducts } from "@/features/products/lib/queries";
import { SearchBox } from "./search-box";

export async function SearchView({ query }: { query: string }) {
  const products = query ? await searchProducts(query) : null;

  return (
    <div className="flex flex-col gap-4 p-4">
      <SearchBox initialQuery={query} />

      {products?.length === 0 && (
        <p className="text-muted-foreground">
          Fant ingen produkter for «{query}».
        </p>
      )}

      {products && products.length > 0 && (
        <ul className="flex flex-col divide-y rounded-lg border">
          {products.map((product) => (
            <li key={product.id}>
              <Link
                href={`/products/${product.id}`}
                className="flex flex-col px-4 py-3 hover:bg-accent"
              >
                <span className="font-medium">{product.name}</span>
                {product.brand && (
                  <span className="text-sm text-muted-foreground">
                    {product.brand}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
