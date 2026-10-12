import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { canEditCatalogue } from "@/features/auth/lib/roles";
import { ScanView } from "@/features/scan/components/scan-view";

export default async function ScanPage() {
  const session = await getServerSession(authOptions);
  const canCreateProducts = !!session && canEditCatalogue(session.user.role);
  return <ScanView canCreateProducts={canCreateProducts} />;
}
