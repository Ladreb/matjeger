import { getServerSession } from "next-auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { canEditCatalogue } from "@/features/auth/lib/roles";
import { authOptions } from "@/features/auth/lib/auth";
import { PostalCodeForm } from "@/features/location/components/postal-code-form";
import { SignOutButton } from "@/features/auth/components/sign-out-button";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <p className="font-semibold">{session?.user?.name}</p>
        <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Postnummer</p>
        <PostalCodeForm initial={session?.user?.postalCode} />
      </div>
      {session && canEditCatalogue(session.user.role) && (
        <Button asChild variant="secondary">
          <Link href="/admin/products">Administrer produkter</Link>
        </Button>
      )}
      <SignOutButton />
    </div>
  );
}
