import { PageColumn } from "@/components/page-column";
import { ProductForm } from "@/features/products/components/product-form";
import { createProduct } from "@/features/products/lib/actions";
import { isValidBarcode } from "@/features/products/lib/barcode";
import { emptyProductFormValues } from "@/features/products/lib/product-form-values";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ barcode?: string | string[] }>;
}) {
  const { barcode } = await searchParams;
  const prefilled = Array.isArray(barcode) ? barcode[0] : barcode;

  return (
    <PageColumn width="narrow" className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Nytt produkt</h1>
      <ProductForm
        action={createProduct}
        initialValues={{
          ...emptyProductFormValues,
          barcode: prefilled && isValidBarcode(prefilled) ? prefilled : "",
        }}
      />
    </PageColumn>
  );
}
