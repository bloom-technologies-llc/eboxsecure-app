import {
  BadgeCheck,
  Gift,
  Heart,
  Percent,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { Container } from "../ui/container";

const benefits = [
  {
    name: "Increased Customer Satisfaction",
    description:
      "Offer a secure delivery option that eliminates package theft and missed deliveries, leading to happier customers.",
    icon: Heart,
  },
  {
    name: "Reduced Delivery Failures",
    description:
      "Virtually eliminate failed deliveries due to customer absence or package theft, reducing costs and customer service inquiries.",
    icon: Truck,
  },
  {
    name: "Enhanced Security",
    description:
      "Provide customers with peace of mind knowing their packages are secure in our warehouse until they're ready for pickup.",
    icon: ShieldCheck,
  },
  {
    name: "No Setup Fees",
    description:
      "There are no costs to retailers for integrating with EboxSecure. We handle all the infrastructure and operations.",
    icon: Percent,
  },
  {
    name: "Simple Integration",
    description:
      "Our Shopify app makes integration seamless, with no coding required. For custom platforms, our API is well-documented and easy to use.",
    icon: BadgeCheck,
  },
  {
    name: "Exclusive Partner Benefits",
    description:
      "Access marketing support, co-branding opportunities, and priority customer service as an EboxSecure retail partner.",
    icon: Gift,
  },
];

export function PartnerBenefits() {
  return (
    <div id="benefits" className="bg-muted/50 py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Partnership Advantages
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Benefits for Retail Partners
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Partnering with EboxSecure offers numerous advantages for retailers
            looking to enhance their delivery options and customer satisfaction.
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
