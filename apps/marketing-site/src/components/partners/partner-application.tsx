"use client";

import Link from "next/link";
import { Check } from "lucide-react";

import { Button } from "@ebox/ui/button";

import { Container } from "../ui/container";

const partnershipTiers = [
  {
    name: "Standard Partner",
    description:
      "For retailers looking to offer EboxSecure as a delivery option with basic integration.",
    features: [
      "Shopify app integration",
      "Virtual address compatibility",
      "Basic customer support",
      "Standard API access",
      "Partner dashboard",
    ],
    requirements: "No minimum order volume",
  },
  {
    name: "Premium Partner",
    description:
      "For medium to large retailers with higher volume and custom integration needs.",
    features: [
      "All Standard Partner features",
      "Priority customer support",
      "Co-marketing opportunities",
      "Advanced API access",
      "Dedicated account manager",
      "Custom integration support",
    ],
    requirements: "Minimum 500 monthly deliveries",
  },
  {
    name: "Enterprise Partner",
    description:
      "For large retailers requiring deep integration and white-label solutions.",
    features: [
      "All Premium Partner features",
      "White-label options",
      "Custom development support",
      "Quarterly business reviews",
      "Early access to new features",
      "Custom reporting and analytics",
    ],
    requirements: "Minimum 2,000 monthly deliveries",
  },
];

const applicationSteps = [
  {
    number: 1,
    title: "Submit Application",
    description:
      "Complete our partner application form with details about your business and integration needs.",
  },
  {
    number: 2,
    title: "Initial Consultation",
    description:
      "Our partnership team will contact you to discuss your needs and determine the best integration approach.",
  },
  {
    number: 3,
    title: "Technical Integration",
    description:
      "Our technical team will guide you through the integration process, whether via Shopify app or custom API.",
  },
  {
    number: 4,
    title: "Testing and Validation",
    description:
      "We'll work together to test the integration and ensure everything is working properly before launch.",
  },
  {
    number: 5,
    title: "Launch and Ongoing Support",
    description:
      "Once live, we provide ongoing support and regular check-ins to ensure your success.",
  },
];

export function PartnerApplication() {
  return (
    <div id="apply" className="bg-muted/50 py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Join Our Network
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Partnership Application Process
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Becoming an EboxSecure retail partner is simple. Follow these steps
            to start offering secure delivery options to your customers.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          <ol className="space-y-10">
            {applicationSteps.map((step) => (
              <li
                key={step.number}
                className="relative flex gap-6 pb-10 last:pb-0"
              >
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-primary text-white">
                  {step.number}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-base text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mx-auto mt-24 max-w-2xl lg:text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Partnership Tiers and Requirements
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            We offer different partnership levels based on your business size
            and needs. Choose the tier that best fits your requirements.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
          {partnershipTiers.map((tier) => (
            <div
              key={tier.name}
              className="flex flex-col overflow-hidden rounded-lg shadow-lg"
            >
              <div className="flex-1 bg-background p-6">
                <h3 className="text-xl font-semibold text-foreground">
                  {tier.name}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {tier.description}
                </p>
                <ul className="mt-6 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="h-5 w-5 flex-shrink-0 text-primary" />
                      <span className="ml-2 text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 rounded-md bg-muted/30 p-3">
                  <p className="text-xs font-medium text-foreground">
                    Requirements:
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tier.requirements}
                  </p>
                </div>
              </div>
              <div className="flex bg-muted/30 p-6">
                <Button asChild className="w-full">
                  <Link href="/contact">Apply Now</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
