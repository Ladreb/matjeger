"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCatalogueEditor } from "@/features/auth/lib/require-catalogue-editor";
import { db } from "@/lib/db";
import { isValidBarcode } from "./barcode";
import {
  readProductFormValues,
  type ExistingProduct,
  type ProductFormState,
  type ProductFormValues,
} from "./product-form-values";
import { validateProduct } from "./validate-product";

export async function createProduct(
  _previous: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const session = await requireCatalogueEditor();
  const values = readProductFormValues(formData);
  const validation = validateProduct(values);
  if (!validation.ok) {
    return { error: validation.error, errorField: validation.errorField, values };
  }

  try {
    await db.product.create({
      data: { ...validation.data, createdById: session.user.id },
    });
  } catch (error) {
    return describeSaveError(error, values);
  }

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(
  id: string,
  _previous: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireCatalogueEditor();
  const values = readProductFormValues(formData);
  const validation = validateProduct(values);
  if (!validation.ok) {
    return { error: validation.error, errorField: validation.errorField, values };
  }

  try {
    await db.product.update({ where: { id }, data: validation.data });
  } catch (error) {
    return describeSaveError(error, values, id);
  }

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

// No revalidate: the row stays on screen with "Angre" until the admin leaves the page.
export async function dismissUnknownBarcode(barcode: string) {
  await requireCatalogueEditor();
  await db.unknownBarcodeScan.updateMany({
    where: { barcode },
    data: { dismissedAt: new Date() },
  });
}

export async function restoreUnknownBarcode(barcode: string) {
  await requireCatalogueEditor();
  await db.unknownBarcodeScan.updateMany({
    where: { barcode },
    data: { dismissedAt: null },
  });
}

export async function findProductWithBarcode(
  barcode: string,
  ignoreProductId?: string,
): Promise<ExistingProduct | null> {
  await requireCatalogueEditor();
  if (!isValidBarcode(barcode)) return null;
  return db.product.findFirst({
    where: {
      barcode,
      id: ignoreProductId ? { not: ignoreProductId } : undefined,
    },
    select: { id: true, name: true },
  });
}

async function describeSaveError(
  error: unknown,
  values: ProductFormValues,
  productId?: string,
): Promise<ProductFormState> {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = String(error.meta?.target ?? "");
      if (target.includes("pluCode")) {
        return {
          error: "Et produkt med denne PLU-koden finnes allerede",
          errorField: "code",
          values,
        };
      }
      return {
        error: "Et produkt med denne strekkoden finnes allerede",
        errorField: "code",
        existingProduct:
          (await findProductWithBarcode(values.barcode, productId)) ?? undefined,
        values,
      };
    }
    if (error.code === "P2025") {
      return { error: "Produktet finnes ikke lenger", values };
    }
  }
  return { error: "Kunne ikke lagre produktet", values };
}
