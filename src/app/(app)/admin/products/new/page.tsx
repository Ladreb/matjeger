import { PageColumn } from "@/components/page-column";
import { ProductForm } from "@/features/products/components/product-form";
import { createProduct } from "@/features/products/lib/actions";
import { emptyProductFormValues } from "@/features/products/lib/product-form-values";

export default function NewProductPage() {
  return (
    <PageColumn width="narrow" className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Nytt produkt</h1>
      <ProductForm action={createProduct} initialValues={emptyProductFormValues} />
    </PageColumn>
  );
}
