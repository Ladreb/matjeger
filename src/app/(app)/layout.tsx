import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/features/auth/lib/auth";
import { Header } from "@/features/navigation/components/header";
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
      <main className="flex-1 pb-16">{children}</main>
      <BottomNav />
    </div>
  );
}
