import Link from "next/link";

import { Button } from "@ebox/ui/button";

import { Container } from "../ui/container";

export function LocationsHero() {
  return (
    <div className="from-primary-50 relative isolate overflow-hidden bg-gradient-to-b to-white pt-14">
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="to-primary-600 relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>

      <Container>
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Our Locations
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Find secure EboxSecure warehouse locations near you. Currently
              serving Carmel, Indiana with plans for expansion to more markets
              soon.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild size="lg">
                <Link href="#current-locations">Current Locations</Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href="#expansion-plans">Expansion Plans</Link>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
