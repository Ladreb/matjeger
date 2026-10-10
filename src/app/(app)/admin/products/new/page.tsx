import { ProductForm } from "@/features/products/components/product-form";
import { createProduct } from "@/features/products/lib/actions";
import { emptyProductFormValues } from "@/features/products/lib/product-form-values";

export default function NewProductPage() {
  return (
    <>
      <h1 className="text-xl font-semibold">Nytt produkt</h1>
      <ProductForm action={createProduct} initialValues={emptyProductFormValues} />
    </>
  );
}
