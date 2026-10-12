import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-4 text-center">
      <h1 className="text-xl font-semibold">Fant ikke siden</h1>
      <p className="text-muted-foreground">
        Siden finnes ikke, eller du har ikke tilgang til den.
      </p>
      <Button asChild className="h-11">
        <Link href="/search">Søk etter varer</Link>
      </Button>
    </div>
  );
}
