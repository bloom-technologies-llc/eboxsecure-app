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
    cta: "Start Free Trial",
    mostPopular: false,
  },
  {
    name: "Basic+",
    id: "tier-basic-plus",
    price: "$19.99",
    description: "Great for regular online shoppers with more delivery needs.",
    features: [
      "Access to 25 EboxSecure locations",
      "5-day package holding",
      "Maximum 20 packages",
      "Standard support",
    ],
    cta: "Start Free Trial",
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
      "Discounted last-mile delivery service",
    ],
    cta: "Start Free Trial",
    mostPopular: true,
  },
  {
    name: "Business Pro",
    id: "tier-business",
    price: "$99.99",
    description: "For businesses with high-volume delivery needs.",
    features: [
      "Unlimited EboxSecure locations",
      "10-day package holding",
      "Maximum 200 packages",
      "Priority support",
      "Returns handling",
      "Discounted last-mile delivery service",
      "Dedicated account management",
    ],
    cta: "Contact Sales",
    mostPopular: false,
  },
];

export function PricingTiers() {
  return (
    <div className="py-24 sm:py-32">
      <Container>
        <div className="mx-auto grid max-w-md grid-cols-1 gap-8 lg:max-w-4xl lg:grid-cols-2 xl:max-w-none xl:grid-cols-4">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`flex transform flex-col rounded-3xl p-8 shadow-md ring-1 ring-border/10 transition-transform hover:scale-105 hover:shadow-lg xl:p-10 ${
                tier.mostPopular
                  ? "bg-primary/5 ring-primary"
                  : "border border-gray-200 bg-background"
              }`}
            >
              <div className="flex items-center justify-between gap-x-4">
                <h3
                  className={`text-lg font-semibold leading-8 ${
                    tier.mostPopular ? "text-primary" : "text-foreground"
                  }`}
                >
                  {tier.name}
                </h3>
                {tier.mostPopular && (
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    Most popular
                  </span>
                )}
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
                      className={`h-6 w-5 flex-none ${
                        tier.mostPopular ? "text-primary" : "text-primary/80"
                      }`}
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className={`mt-8 ${
                  tier.mostPopular
                    ? ""
                    : tier.name === "Business Pro"
                      ? "bg-primary/80 hover:bg-primary"
                      : "bg-primary/80 hover:bg-primary"
                }`}
              >
                <Link
                  href={
                    tier.name === "Business Pro"
                      ? "/contact"
                      : "https://app.eboxsecure.com/signup"
                  }
                >
                  {tier.cta}
                </Link>
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            All plans include a 14-day free trial. No credit card required.
          </p>
          <p className="mt-2 text-muted-foreground">
            Annual billing available with 2 months free.
          </p>
        </div>
      </Container>
    </div>
  );
}
