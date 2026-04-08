import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScanBarcode, ShoppingCart, TrendingDown, Users, BarChart2, BadgeCheck } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";

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
            Matjeger gir deg oversikten du fortjener. Se hva ting faktisk koster og velg butikken som lønner seg for deg.
          </p>
        </AnimatedSection>
      </section>

      {/* How it works */}
      <section className="snap-start flex min-h-[calc(100svh-3.5rem)] flex-col items-center justify-center border-t px-6">
        <AnimatedSection className="mx-auto grid max-w-3xl gap-8 sm:grid-cols-3">
          <div className="flex flex-col gap-3">
            <Users className="size-6 text-primary" />
            <h3 className="font-semibold">Alle hjelper alle</h3>
            <p className="text-sm text-muted-foreground">
              Folk som deg skanner priser i butikk og deler med resten. Alle vinner på det.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <BarChart2 className="size-6 text-primary" />
            <h3 className="font-semibold">Alle kjeder, ett sted</h3>
            <p className="text-sm text-muted-foreground">
              Rema 1000, Kiwi, Meny, Spar og flere. Du slipper å sjekke appen til hver kjede. Alt er samlet her.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <BadgeCheck className="size-6 text-primary" />
            <h3 className="font-semibold">Hele handlelisten</h3>
            <p className="text-sm text-muted-foreground">
              Ikke bare én vare. Matjeger regner ut hvilken butikk som er billigst for alt du trenger å kjøpe.
            </p>
          </div>
        </AnimatedSection>
      </section>

    </main>
  );
}
