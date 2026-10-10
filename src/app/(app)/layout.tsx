import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/features/auth/lib/auth";
import { Header } from "@/features/navigation/components/header";
import { PostalCodeForm } from "@/features/location/components/postal-code-form";
import { BottomNav } from "@/features/navigation/components/bottom-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1 pb-16">
        {!session.user.postalCode && (
          <div className="m-4 flex flex-col gap-3 rounded-lg border p-4">
            <p className="font-semibold">Hvor handler du?</p>
            <p className="text-sm text-muted-foreground">
              Prisene varierer, så vi bruker postnummeret ditt når du
              rapporterer og sammenligner priser.
            </p>
            <PostalCodeForm />
          </div>
        )}
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
