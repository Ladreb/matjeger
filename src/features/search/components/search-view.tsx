import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/features/auth/lib/auth";
import { searchProducts } from "@/features/products/lib/queries";
import { AddToListButton } from "@/features/shopping-list/components/add-to-list-button";
import { SearchBox } from "./search-box";

export async function SearchView({ query }: { query: string }) {
  const session = query ? await getServerSession(authOptions) : null;
  const products =
    query && session ? await searchProducts(query, session.user.id) : null;

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
              </Link>
              <AddToListButton
                productId={product.id}
                productName={product.name}
                initialOnList={product.onList}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
