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
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/login">Kom i gang</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#features">Les mer</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t px-6 py-16">
        <div className="mx-auto grid max-w-3xl gap-8 sm:grid-cols-3">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <ScanBarcode className="size-6 text-primary" />
            </div>
            <h2 className="font-semibold">Skann</h2>
            <p className="text-sm text-muted-foreground">
              Bruk kameraet til å skanne strekkoder på varer i butikk
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <TrendingDown className="size-6 text-primary" />
            </div>
            <h2 className="font-semibold">Sammenlign</h2>
            <p className="text-sm text-muted-foreground">
              Se priser fra Rema, Kiwi, Meny, Spar og alle andre butikker
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <ShoppingCart className="size-6 text-primary" />
            </div>
            <h2 className="font-semibold">Spar</h2>
            <p className="text-sm text-muted-foreground">
              Finn hvilken butikk som er billigst for hele handlelisten din
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
