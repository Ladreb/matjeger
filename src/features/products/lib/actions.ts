"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCatalogueEditor } from "@/features/auth/lib/require-catalogue-editor";
import { db } from "@/lib/db";
import {
  readProductFormValues,
  type ProductFormState,
} from "./product-form-values";
import { validateProduct } from "./validate-product";

export async function createProduct(
  _previous: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const session = await requireCatalogueEditor();
  const values = readProductFormValues(formData);
  const validation = validateProduct(values);
  if (!validation.ok) return { error: validation.error, values };

  try {
    await db.product.create({
      data: { ...validation.data, createdById: session.user.id },
    });
  } catch (error) {
    return { error: describeSaveError(error), values };
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
  if (!validation.ok) return { error: validation.error, values };

  try {
    await db.product.update({ where: { id }, data: validation.data });
  } catch (error) {
    return { error: describeSaveError(error), values };
  }

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

function describeSaveError(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = String(error.meta?.target ?? "");
      return target.includes("pluCode")
        ? "Et produkt med denne PLU-koden finnes allerede"
        : "Et produkt med denne strekkoden finnes allerede";
    }
    if (error.code === "P2025") return "Produktet finnes ikke lenger";
  }
  return "Kunne ikke lagre produktet";
}
