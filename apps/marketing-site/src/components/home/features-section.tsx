import {
  Clock,
  MapPin,
  Package,
  Shield,
  ShoppingBag,
  Truck,
} from "lucide-react";

import { Container } from "@ebox/ui/container";

const features = [
  {
    name: "Virtual Address System",
    description:
      "Get a unique virtual address for all your deliveries. Use it at any retailer checkout for secure delivery to our warehouse.",
    icon: MapPin,
  },
  {
    name: "Shopify App Integration",
    description:
      "Seamlessly select EboxSecure locations during checkout at participating Shopify stores with auto-populated shipping fields.",
    icon: ShoppingBag,
  },
  {
    name: "Enhanced Security",
    description:
      "Protect your packages from theft with secure warehouse storage instead of doorstep delivery.",
    icon: Shield,
  },
  {
    name: "Earlier Access",
    description:
      "Get your packages earlier with B2B delivery times instead of waiting for residential delivery windows.",
    icon: Clock,
  },
  {
    name: "High-Volume Capacity",
    description:
      "Perfect for businesses with large order volumes. No more worrying about package pile-ups.",
    icon: Package,
  },
  {
    name: "All Carrier Compatibility",
    description:
      "Works with all major carriers including UPS, FedEx, USPS, DHL, and more.",
    icon: Truck,
  },
];

export function FeaturesSection() {
  return (
    <div className="bg-background py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Delivery Solutions
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Two Ways to Use EboxSecure
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Whether you're shopping at a Shopify store or any other retailer,
            EboxSecure provides flexible solutions for secure package delivery.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                  <feature.icon
                    className="h-5 w-5 flex-none text-primary"
                    aria-hidden="true"
                  />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </div>
  );
}
