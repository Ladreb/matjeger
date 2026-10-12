import { requireCatalogueEditor } from "@/features/auth/lib/require-catalogue-editor";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireCatalogueEditor();
  return children;
}
