import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "@/features/auth/lib/auth";
import { ProductPrices } from "@/features/pricing/components/product-prices";
import { findLatestPricesPerStore } from "@/features/pricing/lib/queries";
import { findProduct } from "@/features/products/lib/queries";
import { AddToListButton } from "@/features/shopping-list/components/add-to-list-button";
import { isOnList } from "@/features/shopping-list/lib/queries";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, session] = await Promise.all([
    findProduct(id),
    getServerSession(authOptions),
  ]);
  if (!product) notFound();

  const postalCode = session?.user.postalCode;
  const [prices, onList] = await Promise.all([
    postalCode ? findLatestPricesPerStore(id, postalCode) : [],
    session ? isOnList(session.user.id, id) : false,
  ]);

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h1 className="text-xl font-semibold">{product.name}</h1>
        {product.brand && (
          <p className="text-sm text-muted-foreground">{product.brand}</p>
        )}
      </div>

      <AddToListButton
        productId={product.id}
        productName={product.name}
        initialOnList={onList}
        showLabel
      />

      {postalCode && (
        <ProductPrices
          productId={product.id}
          postalCode={postalCode}
          prices={prices}
        />
      )}
    </div>
  );
}
