import { Lightbulb, Package, Shield, Truck } from "lucide-react";

import { Container } from "../ui/container";

const innovations = [
  {
    name: "Virtual Address System",
    description:
      "Our unique virtual address system allows customers to receive packages at our secure warehouses from any retailer, without requiring integration.",
    icon: Lightbulb,
  },
  {
    name: "Secure Warehouse Network",
    description:
      "We've built a network of secure warehouses designed specifically for package handling, with advanced security systems and efficient storage.",
    icon: Shield,
  },
  {
    name: "Carrier Compatibility",
    description:
      "Our system works with all major carriers, ensuring that no matter who delivers your package, it arrives safely at our secure location.",
    icon: Truck,
  },
  {
    name: "High-Volume Capacity",
    description:
      "Unlike residential deliveries, our warehouses can handle large volumes of packages, making us ideal for businesses with frequent deliveries.",
    icon: Package,
  },
];

export function AboutInnovation() {
  return (
    <div className="bg-background py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Innovation in Logistics
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Transforming Package Delivery
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            At EboxSecure, we're committed to developing innovative solutions
            that address the challenges of modern package delivery. Our approach
            combines secure physical infrastructure with smart technology.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
            {innovations.map((item) => (
              <div key={item.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                  <item.icon
                    className="h-5 w-5 flex-none text-primary"
                    aria-hidden="true"
                  />
                  {item.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">{item.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </div>
  );
}
