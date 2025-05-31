"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";

import { Button } from "@ebox/ui/button";

import { Container } from "../ui/container";

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="relative isolate overflow-hidden bg-background pt-14">
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-primary/30 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>

      <Container className="py-24 sm:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Secure Package Delivery for Your Business
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Protect your packages from theft while getting earlier access and
            unlimited capacity for high-volume deliveries.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <div className="relative flex-1 sm:max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MapPin
                  className="h-5 w-5 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
              <input
                type="text"
                className="block w-full rounded-md border-0 py-2.5 pl-10 pr-3.5 text-foreground ring-1 ring-inset ring-border focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Find locations near you..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button className="sm:flex-none">Search</Button>
          </div>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href="https://app.eboxsecure.com">Go to app</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
