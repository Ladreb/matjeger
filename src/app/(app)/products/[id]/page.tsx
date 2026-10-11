import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "@/features/auth/lib/auth";
import { LatestPrices } from "@/features/pricing/components/latest-prices";
import { ReportPriceForm } from "@/features/pricing/components/report-price-form";
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
        <>
          <section className="flex flex-col gap-2">
            <h2 className="font-medium">Priser i {postalCode}</h2>
            <LatestPrices prices={prices} postalCode={postalCode} />
          </section>
          <section className="flex flex-col gap-2">
            <h2 className="font-medium">Rapporter pris</h2>
            <ReportPriceForm productId={product.id} />
          </section>
        </>
      )}
    </div>
  );
}
