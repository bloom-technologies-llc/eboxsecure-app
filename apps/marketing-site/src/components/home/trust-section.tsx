import { Clock, Package, ShieldCheck, Truck } from "lucide-react";

import { Container } from "@ebox/ui/container";

const stats = [
  { id: 1, name: "Secure Deliveries", value: "100%", icon: ShieldCheck },
  { id: 2, name: "Earlier Access", value: "24hr", icon: Clock },
  { id: 3, name: "Package Capacity", value: "200+", icon: Package },
  { id: 4, name: "Carrier Compatibility", value: "All", icon: Truck },
];

export function TrustSection() {
  return (
    <div className="bg-muted/50 py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Trusted by Businesses in Carmel, Indiana
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              EboxSecure provides reliable package delivery solutions for
              businesses of all sizes.
            </p>
          </div>
          <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.id} className="flex flex-col bg-muted p-8">
                <dt className="text-sm font-semibold leading-6 text-muted-foreground">
                  {stat.name}
                </dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <stat.icon className="h-6 w-6 text-primary" />
                    <span>{stat.value}</span>
                  </div>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </div>
  );
}
