"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  ProductFormState,
  ProductFormValues,
} from "../lib/product-form-values";

type ProductFormProps = {
  action: (
    previous: ProductFormState,
    formData: FormData,
  ) => Promise<ProductFormState>;
  initialValues: ProductFormValues;
};

export function ProductForm({ action, initialValues }: ProductFormProps) {
  const [state, formAction, pending] = useActionState(action, null);
  const values = state?.values ?? initialValues;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Navn" name="name" defaultValue={values.name} />
      <Field label="Merke (valgfritt)" name="brand" defaultValue={values.brand} />
      <Field
        label="Strekkode"
        name="barcode"
        inputMode="numeric"
        defaultValue={values.barcode}
      />
      <Field
        label="PLU-kode (for varer uten strekkode)"
        name="pluCode"
        inputMode="numeric"
        defaultValue={values.pluCode}
      />
      <Field
        label="Vekt i gram (valgfritt)"
        name="weightG"
        inputMode="numeric"
        defaultValue={values.weightG}
      />
      <Field
        label="Volum i milliliter (valgfritt)"
        name="volumeMl"
        inputMode="numeric"
        defaultValue={values.volumeMl}
      />

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          Lagre
        </Button>
        <Button asChild variant="ghost">
          <Link href="/admin/products">Avbryt</Link>
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  ...inputProps
}: { label: string } & React.ComponentProps<typeof Input>) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium">
      {label}
      <Input {...inputProps} />
    </label>
  );
}
