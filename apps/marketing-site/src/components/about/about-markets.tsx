import Link from "next/link";
import { MapPin } from "lucide-react";

import { Button } from "@ebox/ui/button";
import { Container } from "@ebox/ui/container";

export function AboutMarkets() {
  return (
    <div className="bg-muted/50 py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Our Market Presence
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            EboxSecure is currently operating in Carmel, Indiana, with plans to
            expand to additional markets in the near future. Our flagship
            location serves as a model for our secure warehouse delivery
            concept.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl lg:mx-0 lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="relative h-80 overflow-hidden rounded-xl bg-muted">
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Map of Carmel, Indiana Location
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="rounded-2xl bg-background p-8">
                <div className="flex items-center gap-x-4">
                  <MapPin className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-semibold leading-8 text-foreground">
                    Carmel, Indiana
                  </h3>
                </div>
                <p className="mt-4 text-base leading-7 text-muted-foreground">
                  Our flagship location in Carmel features a state-of-the-art
                  warehouse facility with advanced security systems, efficient
                  package processing, and convenient customer pickup options.
                </p>
                <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-x-2">
                    <span className="font-medium text-foreground">
                      Address:
                    </span>
                    <span>123 Main Street, Carmel, IN 46032</span>
                  </li>
                  <li className="flex gap-x-2">
                    <span className="font-medium text-foreground">Hours:</span>
                    <span>
                      Monday-Friday: 8am-8pm, Saturday: 9am-5pm, Sunday: Closed
                    </span>
                  </li>
                  <li className="flex gap-x-2">
                    <span className="font-medium text-foreground">
                      Capacity:
                    </span>
                    <span>Over 10,000 packages per day</span>
                  </li>
                </ul>
                <div className="mt-8">
                  <Button asChild>
                    <Link href="/locations">View All Locations</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16">
            <h3 className="text-xl font-semibold leading-8 text-foreground">
              Expansion Plans
            </h3>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              We're committed to expanding our network of secure warehouse
              locations to serve more communities. Our strategic growth plan
              focuses on metropolitan areas with high e-commerce activity and
              demand for secure delivery solutions.
            </p>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              If you're interested in bringing EboxSecure to your area, please
              contact our business development team to discuss partnership
              opportunities.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
