import Link from "next/link";
import { Check } from "lucide-react";

import { Button } from "@ebox/ui/button";

import { Container } from "../ui/container";

const tiers = [
  {
    name: "Basic",
    id: "tier-basic",
    price: "$9.99",
    description: "Perfect for individuals with occasional package deliveries.",
    features: [
      "Access to 3 EboxSecure locations",
      "2-day package holding",
      "Maximum 5 packages",
      "Standard support",
    ],
    cta: "Go to app",
    mostPopular: false,
  },
  {
    name: "Premium",
    id: "tier-premium",
    price: "$49.99",
    description: "Ideal for small businesses with regular deliveries.",
    features: [
      "Access to 75 EboxSecure locations",
      "7-day package holding",
      "Maximum 50 packages",
      "Priority support",
      "Returns handling",
      "Discounted last-mile service",
    ],
    cta: "Go to app",
    mostPopular: true,
  },
];

export function PricingPreview() {
  return (
    <div className="bg-background py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Pricing
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple, Transparent Pricing
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Choose the plan that works best for your business needs. All plans
            include our secure warehouse delivery service.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2">
          {tiers.map((tier, tierIdx) => (
            <div
              key={tier.id}
              className={`${
                tier.mostPopular
                  ? "relative bg-muted shadow-2xl"
                  : "bg-muted/50 sm:mx-8 lg:mx-0"
              } rounded-3xl p-8 ring-1 ring-border/10 sm:p-10`}
            >
              {tier.mostPopular && (
                <div className="absolute -top-3 right-10 z-10 inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-medium text-white">
                  Most popular
                </div>
              )}
              <div className="flex flex-col">
                <div className="flex items-center justify-between gap-x-4">
                  <h3 className="text-lg font-semibold leading-8 text-foreground">
                    {tier.name}
                  </h3>
                </div>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {tier.description}
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-foreground">
                    {tier.price}
                  </span>
                  <span className="text-sm font-semibold leading-6 text-muted-foreground">
                    /month
                  </span>
                </p>
                <ul
                  role="list"
                  className="mt-8 space-y-3 text-sm leading-6 text-muted-foreground"
                >
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <Check
                        className="h-6 w-5 flex-none text-primary"
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={`mt-8 ${
                    tier.mostPopular ? "" : "bg-primary/80 hover:bg-primary"
                  }`}
                >
                  <Link href="https://app.eboxsecure.com">{tier.cta}</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button asChild variant="outline">
            <Link href="/pricing">View all pricing options</Link>
          </Button>
        </div>
      </Container>
    </div>
  );
}
