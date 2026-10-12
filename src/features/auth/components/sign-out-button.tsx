"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      variant="outline"
      className="sm:w-fit"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Logg ut
    </Button>
  );
}
