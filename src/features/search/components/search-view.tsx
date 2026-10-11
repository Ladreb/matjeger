import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchProducts } from "@/features/products/lib/queries";

export async function SearchView({ query }: { query: string }) {
  const products = query ? await searchProducts(query) : null;

  return (
    <div className="flex flex-col gap-4 p-4">
      <form action="/search" className="flex gap-2">
        <Input
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Søk etter navn eller merke"
          aria-label="Søk etter produkter"
        />
        <Button type="submit">Søk</Button>
      </form>

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
