import { notFound } from "next/navigation";
import { PageColumn } from "@/components/page-column";
import { requireCatalogueEditor } from "@/features/auth/lib/require-catalogue-editor";
import { ProductForm } from "@/features/products/components/product-form";
import { updateProduct } from "@/features/products/lib/actions";
import { productToFormValues } from "@/features/products/lib/product-form-values";
import { findProduct } from "@/features/products/lib/queries";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // The layout guard runs in parallel with the page, so the page must check too.
  await requireCatalogueEditor();
  const { id } = await params;
  const product = await findProduct(id);
  if (!product) notFound();

  return (
    <PageColumn width="narrow" className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Rediger produkt</h1>
      <ProductForm
        action={updateProduct.bind(null, product.id)}
        initialValues={productToFormValues(product)}
      />
    </PageColumn>
  );
}
