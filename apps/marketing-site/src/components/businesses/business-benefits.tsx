import {
  BarChart,
  DollarSign,
  Heart,
  ShieldCheck,
  TrendingUp,
  Truck,
} from "lucide-react";

import { Container } from "../ui/container";

const benefits = [
  {
    name: "Increased Delivery Success",
    description:
      "Eliminate failed deliveries due to package theft or customer absence, achieving near 100% delivery success rates.",
    icon: TrendingUp,
  },
  {
    name: "Reduced Shipping Costs",
    description:
      "Save on reshipment costs, return processing, and customer service resources needed to handle delivery issues.",
    icon: DollarSign,
  },
  {
    name: "Enhanced Customer Satisfaction",
    description:
      "Provide customers with a secure, convenient delivery option that fits their busy lifestyles and increases loyalty.",
    icon: Heart,
  },
  {
    name: "Reduced Liability",
    description:
      "Minimize responsibility for packages left unattended, reducing claims for lost or stolen deliveries.",
    icon: ShieldCheck,
  },
  {
    name: "Simplified Logistics",
    description:
      "Consolidate deliveries to a single location rather than multiple residential addresses, streamlining your delivery process.",
    icon: Truck,
  },
  {
    name: "Valuable Analytics",
    description:
      "Gain insights into delivery patterns, customer behavior, and operational efficiency through our business dashboard.",
    icon: BarChart,
  },
];

export function BusinessBenefits() {
  return (
    <div className="bg-muted/50 py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Business Advantages
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Benefits for Retailers & Businesses
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            EboxSecure offers significant advantages for businesses looking to
            improve their delivery operations, reduce costs, and enhance
            customer satisfaction.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3">
            {benefits.map((benefit) => (
              <div key={benefit.name} className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-foreground">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <benefit.icon
                      className="h-6 w-6 text-white"
                      aria-hidden="true"
                    />
                  </div>
                  {benefit.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-muted-foreground">
                  {benefit.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </div>
  );
}
