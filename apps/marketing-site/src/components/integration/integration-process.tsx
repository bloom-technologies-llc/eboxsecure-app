import {
  ArrowRight,
  Download,
  Settings,
  ShoppingCart,
  Zap,
} from "lucide-react";

import { Container } from "../ui/container";

const steps = [
  {
    id: 1,
    name: "Install the App",
    description:
      "Find the EboxSecure app in the Shopify App Store and install it to your store with just a few clicks.",
    icon: Download,
  },
  {
    id: 2,
    name: "Configure Settings",
    description:
      "Set up your EboxSecure warehouse locations, customize the checkout experience, and configure notification preferences.",
    icon: Settings,
  },
  {
    id: 3,
    name: "Integrate with Checkout",
    description:
      "Our app automatically adds EboxSecure as a shipping option in your checkout process with location selection.",
    icon: ShoppingCart,
  },
  {
    id: 4,
    name: "Go Live",
    description:
      "Activate the integration and start offering secure warehouse delivery to your customers immediately.",
    icon: Zap,
  },
];

export function IntegrationProcess() {
  return (
    <div id="shopify-integration" className="py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Shopify Integration
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple Installation Process
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Our Shopify app makes it easy to offer EboxSecure's secure delivery
            option to your customers. Follow these simple steps to get started.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {steps.map((step, stepIdx) => (
              <div key={step.id} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <step.icon
                      className="h-6 w-6 text-white"
                      aria-hidden="true"
                    />
                  </div>
                  <span>
                    Step {step.id}: {step.name}
                  </span>
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">{step.description}</p>
                  {stepIdx !== steps.length - 1 && (
                    <div className="mt-6 hidden lg:block">
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </div>
  );
}
