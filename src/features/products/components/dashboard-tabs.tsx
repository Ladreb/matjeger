import Link from "next/link";
import { cn } from "@/lib/utils";
import { dashboardHref, type DashboardTab } from "../lib/dashboard";

type Props = {
  active: DashboardTab;
  unknownBarcodeCount: number;
};

export function DashboardTabs({ active, unknownBarcodeCount }: Props) {
  return (
    <nav aria-label="Visning" className="flex gap-1 border-b">
      <TabLink href={dashboardHref({})} isActive={active === "products"}>
        Produkter
      </TabLink>
      <TabLink
        href={dashboardHref({ tab: "unknown" })}
        isActive={active === "unknown"}
      >
        Ukjente strekkoder
        {unknownBarcodeCount > 0 && (
          <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
            {unknownBarcodeCount}
          </span>
        )}
      </TabLink>
    </nav>
  );
}

function TabLink({
  href,
  isActive,
  children,
}: {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "-mb-px flex min-h-11 items-center gap-2 border-b-2 px-3 text-sm font-medium",
        isActive
          ? "border-primary"
          : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
