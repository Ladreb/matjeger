import { requireCatalogueEditor } from "@/features/auth/lib/require-catalogue-editor";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireCatalogueEditor();
  return <div className="flex flex-col gap-6 p-6">{children}</div>;
}
