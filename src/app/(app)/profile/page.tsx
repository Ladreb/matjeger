import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { SignOutButton } from "@/features/auth/components/sign-out-button";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <p className="font-semibold">{session?.user?.name}</p>
        <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
      </div>
      <SignOutButton />
    </div>
  );
}
