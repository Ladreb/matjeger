import Link from "next/link";
import { PageColumn } from "@/components/page-column";
import { Button } from "@/components/ui/button";
import { listProducts } from "@/features/products/lib/queries";

export default async function AdminProductsPage() {
  const products = await listProducts();

  return (
    <PageColumn width="wide" className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Produkter</h1>
        <Button asChild>
          <Link href="/admin/products/new">Nytt produkt</Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <p className="text-muted-foreground">Ingen produkter ennå.</p>
      ) : (
        <ul className="flex flex-col divide-y rounded-lg border">
          {products.map((product) => (
            <li key={product.id}>
              <Link
                href={`/admin/products/${product.id}`}
                className="flex flex-col px-4 py-3 hover:bg-accent"
              >
                <span className="font-medium">{product.name}</span>
                <span className="text-sm text-muted-foreground">
                  {[product.brand, product.barcode ?? product.pluCode]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageColumn>
  );
}
