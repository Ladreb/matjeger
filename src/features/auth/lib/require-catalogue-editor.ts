import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "./auth";
import { canEditCatalogue } from "./roles";

export async function requireCatalogueEditor() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (!canEditCatalogue(session.user.role)) notFound();
  return session;
}
