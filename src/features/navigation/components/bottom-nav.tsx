"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScanBarcode, Search, ShoppingCart, User } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/scan", label: "Skann", icon: ScanBarcode },
  { href: "/search", label: "Søk", icon: Search },
  { href: "/shopping-list", label: "Handleliste", icon: ShoppingCart },
  { href: "/profile", label: "Profil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
      <ul className="flex h-16 items-stretch">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <li key={href} className="flex flex-1">
              <Link
                href={href}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-5" />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
