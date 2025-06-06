import { ArrowRight, Clock, Package, Truck, User } from "lucide-react";

import { Container } from "@ebox/ui/container";

const steps = [
  {
    id: 1,
    name: "Sign Up",
    description:
      "Create your EboxSecure account and get your unique virtual address for package deliveries.",
    icon: User,
  },
  {
    id: 2,
    name: "Shop Online",
    description:
      "Shop at any retailer and use your EboxSecure virtual address during checkout.",
    icon: Package,
  },
  {
    id: 3,
    name: "We Receive Your Package",
    description:
      "Your package is delivered to our secure warehouse where it's logged and stored safely.",
    icon: Truck,
  },
  {
    id: 4,
    name: "Pick Up When Ready",
    description:
      "Visit our location at your convenience to pick up your package with our simple verification process.",
    icon: Clock,
  },
];

export function CustomerHowItWorks() {
  return (
    <div id="how-it-works" className="py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Simple Process
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How EboxSecure Works for You
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Our service is designed to be simple and convenient, ensuring your
            packages are always secure and available when you need them.
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
