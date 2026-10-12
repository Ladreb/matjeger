import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScanBarcode, ShoppingCart, TrendingDown, Users, BarChart2, BadgeCheck } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";

const EXAMPLE_PRICES = [
  { store: "Rema 1000", price: "20,90 kr" },
  { store: "Kiwi", price: "21,50 kr" },
  { store: "Meny", price: "23,90 kr" },
];

export default function LandingPage() {
  return (
    <main className="flex flex-col snap-y snap-mandatory overflow-y-scroll h-[calc(100svh-3.5rem)]">
      {/* Hero */}
      <section className="hero-gradient snap-start relative flex min-h-[calc(100svh-3.5rem)] flex-col items-center justify-center px-6 text-center">
        <AnimatedSection className="flex flex-col items-center gap-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Finn riktig butikk før du handler
          </h1>
          <p className="text-lg text-muted-foreground">
            Bli med og bygge Norges mest folkelige matprisplattform.
          </p>
          <Button size="lg" asChild>
            <Link href="/login">Kom i gang</Link>
          </Button>
        </AnimatedSection>
        <div className="absolute bottom-16 grid w-full max-w-3xl grid-cols-3 gap-4 px-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/20">
              <ScanBarcode className="size-6 text-primary" />
            </div>
            <span className="font-semibold">Skann</span>
          </div>
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/20">
              <TrendingDown className="size-6 text-primary" />
            </div>
            <span className="font-semibold">Sammenlign</span>
          </div>
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/20">
              <ShoppingCart className="size-6 text-primary" />
            </div>
            <span className="font-semibold">Spar</span>
          </div>
        </div>
      </section>

      {/* Problem → Control */}
      <section className="snap-start flex min-h-[calc(100svh-3.5rem)] flex-col items-center justify-center border-t px-6 text-center">
        <AnimatedSection className="max-w-xl">
          <p className="text-2xl font-bold tracking-tight sm:text-3xl">
            Matprisene stiger. Få kontrollen.
          </p>
          <p className="mt-4 text-muted-foreground">
            Se hva ting faktisk koster og finn butikken som lønner seg for deg.
          </p>
        </AnimatedSection>
      </section>

      {/* Example */}
      <section className="snap-start flex min-h-[calc(100svh-3.5rem)] flex-col items-center justify-center gap-6 border-t px-6 text-center">
        <AnimatedSection className="flex w-full max-w-sm flex-col items-center gap-6">
          <p className="text-2xl font-bold tracking-tight sm:text-3xl">
            Se prisene side om side
          </p>
          <div className="w-full rounded-lg border bg-card p-4 text-left shadow-sm">
            <p className="font-semibold">Lettmelk 1 l</p>
            <p className="text-sm text-muted-foreground">Tine</p>
            <ul className="mt-3 flex flex-col divide-y rounded-lg border">
              {EXAMPLE_PRICES.map((row, index) => (
                <li key={row.store} className="flex items-center justify-between p-3">
                  <span className="flex items-center gap-2 font-medium">
                    {row.store}
                    {index === 0 && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                        Billigst
                      </span>
                    )}
                  </span>
                  <span className="font-semibold">{row.price}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-muted-foreground">
            Eksempel. Prisene i appen kommer fra brukerne.
          </p>
        </AnimatedSection>
      </section>

      {/* How it works */}
      <section className="snap-start flex min-h-[calc(100svh-3.5rem)] flex-col items-center justify-center border-t px-6">
        <AnimatedSection className="flex flex-col items-center gap-16 mx-auto max-w-3xl">
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="flex flex-col gap-3">
              <Users className="size-6 text-primary" />
              <h3 className="font-semibold">Alle hjelper alle</h3>
              <p className="text-sm text-muted-foreground">
                Hver skanning bidrar til fellesskapet.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <BarChart2 className="size-6 text-primary" />
              <h3 className="font-semibold">Alle kjeder, ett sted</h3>
              <p className="text-sm text-muted-foreground">
                Rema, Kiwi, Meny, Spar og flere. Alt samlet på ett sted.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <BadgeCheck className="size-6 text-primary" />
              <h3 className="font-semibold">Hele handlelisten</h3>
              <p className="text-sm text-muted-foreground">
                Matjeger finner billigste butikk for hele handlelisten din.
              </p>
            </div>
          </div>
          <Button size="lg" asChild>
            <Link href="/login">Kom i gang</Link>
          </Button>
        </AnimatedSection>
      </section>

    </main>
  );
}
