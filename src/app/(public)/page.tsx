import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScanBarcode, ShoppingCart, TrendingDown, Users, BarChart2, BadgeCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="flex flex-col snap-y snap-mandatory overflow-y-scroll h-[calc(100svh-3.5rem)]">
      {/* Hero */}
      <section className="snap-start flex min-h-[calc(100svh-3.5rem)] flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Finn billigste dagligvare
        </h1>
        <p className="max-w-md text-lg text-muted-foreground">
          Skann strekkoder i butikk og se hvor du handler billigst. Bygget på folkelig innsamling av priser.
        </p>
        <Button size="lg" asChild>
          <Link href="/login">Kom i gang</Link>
        </Button>
        <div className="mt-8 grid w-full max-w-3xl grid-cols-3 gap-4">
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
        <p className="text-2xl font-bold tracking-tight sm:text-3xl">
          Matprisene stiger. Få kontrollen.
        </p>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Med Matjeger vet du alltid hvilken butikk som er billigst — for enkeltprodukter og hele handlelisten. Ta de riktige beslutningene, hver gang du handler.
        </p>
      </section>

      {/* How it works */}
      <section className="snap-start flex min-h-[calc(100svh-3.5rem)] flex-col items-center justify-center border-t px-6">
        <div className="mx-auto grid max-w-3xl gap-8 sm:grid-cols-3">
          <div className="flex flex-col gap-3">
            <Users className="size-6 text-primary" />
            <h3 className="font-semibold">Folkelig og åpen</h3>
            <p className="text-sm text-muted-foreground">
              Prisene rapporteres av vanlige folk i butikken. Jo flere som bidrar, jo bedre blir det for alle.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <BarChart2 className="size-6 text-primary" />
            <h3 className="font-semibold">Alle kjeder, ett sted</h3>
            <p className="text-sm text-muted-foreground">
              Rema 1000, Kiwi, Meny, Spar og flere — samlet på ett sted så du slipper å lete selv.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <BadgeCheck className="size-6 text-primary" />
            <h3 className="font-semibold">Hele handlelisten</h3>
            <p className="text-sm text-muted-foreground">
              Ikke bare enkeltprodukter. Finn ut hvilken butikk som er billigst for alt du trenger å kjøpe.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="snap-start flex min-h-[calc(100svh-3.5rem)] flex-col items-center justify-center border-t px-6 text-center">
        <p className="text-2xl font-bold tracking-tight sm:text-3xl">Klar til å handle smartere?</p>
        <p className="mt-3 text-muted-foreground">Gratis å bruke. Bidrag fra folk som deg.</p>
        <Button size="lg" className="mt-6" asChild>
          <Link href="/login">Kom i gang gratis</Link>
        </Button>
      </section>
    </main>
  );
}
