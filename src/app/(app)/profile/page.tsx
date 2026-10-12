import { getServerSession } from "next-auth";
import Link from "next/link";
import { PageColumn } from "@/components/page-column";
import { Button } from "@/components/ui/button";
import { canEditCatalogue } from "@/features/auth/lib/roles";
import { authOptions } from "@/features/auth/lib/auth";
import { FavouriteStoresForm } from "@/features/pricing/components/favourite-stores-form";
import { PostalCodeForm } from "@/features/location/components/postal-code-form";
import { db } from "@/lib/db";
import { SignOutButton } from "@/features/auth/components/sign-out-button";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const user = session
    ? await db.user.findUnique({
        where: { id: session.user.id },
        select: { favouriteStores: true },
      })
    : null;

  return (
    <PageColumn width="narrow" className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <p className="font-semibold">{session?.user?.name}</p>
        <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Postnummer</p>
        <PostalCodeForm initial={session?.user?.postalCode} />
      </div>
      <div className="flex flex-col gap-2">
        <p id="favourite-stores-label" className="text-sm font-medium">
          Favorittbutikker
        </p>
        <p className="text-sm text-muted-foreground">
          Vises først når du rapporterer en pris.
        </p>
        <FavouriteStoresForm initial={user?.favouriteStores ?? []} />
      </div>
      {session && canEditCatalogue(session.user.role) && (
        <Button asChild variant="secondary" className="sm:w-fit">
          <Link href="/admin/products">Administrer produkter</Link>
        </Button>
      )}
      <SignOutButton />
    </PageColumn>
  );
}
