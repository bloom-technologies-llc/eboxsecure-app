import Link from "next/link";
import { Code, FileJson, Webhook } from "lucide-react";

import { Button } from "@ebox/ui/button";
import { Container } from "@ebox/ui/container";

const integrationOptions = [
  {
    name: "API Integration",
    description:
      "Connect directly to our secure delivery network using our comprehensive REST API.",
    icon: Code,
    features: [
      "Real-time package tracking",
      "Automated customer notifications",
      "Delivery status webhooks",
      "Analytics and reporting",
    ],
  },
  {
    name: "E-commerce Plugins",
    description:
      "Easy integration with popular e-commerce platforms through our pre-built plugins.",
    icon: FileJson,
    features: [
      "Shopify integration",
      "WooCommerce plugin",
      "Magento extension",
      "Custom platform support",
    ],
  },
  {
    name: "Webhook Notifications",
    description:
      "Receive real-time updates about package status changes via webhook notifications.",
    icon: Webhook,
    features: [
      "Delivery confirmations",
      "Customer pickup alerts",
      "Exception notifications",
      "Custom event triggers",
    ],
  },
];

export function BusinessIntegration() {
  return (
    <div className="py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Technical Integration
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Easy to Implement, Powerful to Use
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            EboxSecure offers multiple integration options to fit your technical
            infrastructure and business needs.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
          {integrationOptions.map((option) => (
            <div
              key={option.name}
              className="flex flex-col overflow-hidden rounded-lg shadow-lg"
            >
              <div className="flex-1 bg-background px-6 py-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
                  <option.icon
                    className="h-6 w-6 text-white"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-foreground">
                  {option.name}
                </h3>
                <p className="mt-2 text-base text-muted-foreground">
                  {option.description}
                </p>
                <ul className="mt-6 space-y-3">
                  {option.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-primary"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <p className="ml-2 text-sm text-muted-foreground">
                        {feature}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex bg-muted/30 p-6">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/documentation">View Documentation</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-2xl text-center">
          <p className="text-base text-muted-foreground">
            Need a custom integration solution? Our development team is ready to
            help.
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/contact">Contact Our Integration Team</Link>
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
