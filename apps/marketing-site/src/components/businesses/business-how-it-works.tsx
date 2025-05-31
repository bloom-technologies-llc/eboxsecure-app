import { ArrowRight, BarChart, Building, Database, Truck } from "lucide-react";

import { Container } from "@ebox/ui/container";

const steps = [
  {
    id: 1,
    name: "Partner with EboxSecure",
    description:
      "Integrate our secure delivery solution into your checkout process or direct customers to use their EboxSecure virtual address.",
    icon: Building,
  },
  {
    id: 2,
    name: "Ship as Usual",
    description:
      "Continue using your existing shipping carriers and processes. No need to change your logistics operations.",
    icon: Truck,
  },
  {
    id: 3,
    name: "We Handle the Last Mile",
    description:
      "Packages are securely received at our warehouse, logged in our system, and stored until customer pickup.",
    icon: Database,
  },
  {
    id: 4,
    name: "Track Performance",
    description:
      "Access detailed analytics on delivery success rates, customer satisfaction, and cost savings through our business dashboard.",
    icon: BarChart,
  },
];

export function BusinessHowItWorks() {
  return (
    <div id="how-it-works" className="py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Seamless Integration
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How EboxSecure Works for Businesses
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Our service integrates easily with your existing operations,
            providing a secure delivery solution that enhances customer
            satisfaction and reduces costs.
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
