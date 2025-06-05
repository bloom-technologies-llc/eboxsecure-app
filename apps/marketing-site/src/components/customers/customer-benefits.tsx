import { Bell, Clock, Lock, MapPin, Shield, Zap } from "lucide-react";

import { Container } from "@ebox/ui/container";

const benefits = [
  {
    name: "Package Security",
    description:
      "Your packages are stored in our secure warehouse with 24/7 surveillance and controlled access.",
    icon: Shield,
  },
  {
    name: "Flexible Pickup",
    description:
      "Pick up your packages when it's convenient for you, with extended hours including evenings and weekends.",
    icon: Clock,
  },
  {
    name: "Real-time Notifications",
    description:
      "Receive instant notifications when your package arrives at our facility and is ready for pickup.",
    icon: Bell,
  },
  {
    name: "Convenient Location",
    description:
      "Our warehouse is strategically located for easy access, with ample parking and quick service.",
    icon: MapPin,
  },
  {
    name: "Fast Processing",
    description:
      "Quick and efficient package processing means your items are ready for pickup shortly after arrival.",
    icon: Zap,
  },
  {
    name: "Privacy Protection",
    description:
      "Your home address remains private, reducing the risk of package theft and protecting your personal information.",
    icon: Lock,
  },
];

export function CustomerBenefits() {
  return (
    <div className="bg-muted/50 py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Customer Benefits
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Why Choose EboxSecure
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            EboxSecure offers numerous advantages over traditional home
            delivery, providing peace of mind and convenience for all your
            package needs.
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
