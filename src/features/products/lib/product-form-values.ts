import type { Product } from "@prisma/client";

export type ProductFormValues = {
  barcode: string;
  pluCode: string;
  name: string;
  brand: string;
  description: string;
  weightG: string;
  volumeMl: string;
};

export type ProductFormState = { error: string; values: ProductFormValues } | null;

export const emptyProductFormValues: ProductFormValues = {
  barcode: "",
  pluCode: "",
  name: "",
  brand: "",
  description: "",
  weightG: "",
  volumeMl: "",
};

export function productToFormValues(product: Product): ProductFormValues {
  return {
    barcode: product.barcode ?? "",
    pluCode: product.pluCode ?? "",
    name: product.name,
    brand: product.brand ?? "",
    description: product.description ?? "",
    weightG: product.weightG?.toString() ?? "",
    volumeMl: product.volumeMl?.toString() ?? "",
  };
}

export function readProductFormValues(formData: FormData): ProductFormValues {
  const read = (field: keyof ProductFormValues) =>
    String(formData.get(field) ?? "").trim();

  return {
    barcode: read("barcode"),
    pluCode: read("pluCode"),
    name: read("name"),
    brand: read("brand"),
    description: read("description"),
    weightG: read("weightG"),
    volumeMl: read("volumeMl"),
  };
}
