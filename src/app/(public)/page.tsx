import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScanBarcode, ShoppingCart, TrendingDown } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Finn billigste dagligvare
        </h1>
        <p className="max-w-md text-lg text-muted-foreground">
          Skann strekkoder i butikk og se hvor du handler billigst. Bygget på folkelig innsamling av priser.
        </p>
        <Button size="lg" asChild>
          <Link href="/login">Logg inn</Link>
        </Button>
      </section>

      {/* Features */}
      <section id="features" className="border-t px-6 py-16">
        <div className="mx-auto grid max-w-3xl gap-8 sm:grid-cols-3">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/20">
              <ScanBarcode className="size-6 text-primary" />
            </div>
            <h2 className="font-semibold">Skann</h2>
          </div>
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/20">
              <TrendingDown className="size-6 text-primary" />
            </div>
            <h2 className="font-semibold">Sammenlign</h2>
          </div>
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/20">
              <ShoppingCart className="size-6 text-primary" />
            </div>
            <h2 className="font-semibold">Spar</h2>
          </div>
        </div>
      </section>
    </main>
  );
}
