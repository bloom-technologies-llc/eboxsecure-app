import { Clock, MapPin, Phone, Truck } from "lucide-react";

import { Container } from "../ui/container";

const locationDetails = {
  address: "123 Main Street, Carmel, IN 46032",
  hours:
    "Monday - Friday: 8:00 AM - 6:00 PM\nSaturday: 9:00 AM - 1:00 PM\nSunday: Closed",
  phone: "(317) 555-1234",
  features: [
    "24/7 secure access for premium members",
    "Climate-controlled storage",
    "Video surveillance",
    "Package tracking system",
    "Loading dock for large deliveries",
    "Ample parking",
  ],
};

export function LocationsDetails() {
  return (
    <div className="bg-muted/50 py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Location Details
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Our Carmel warehouse location offers state-of-the-art security
                and convenience features to ensure your packages are safe and
                accessible when you need them.
              </p>

              <dl className="mt-10 space-y-6 text-base leading-7 text-muted-foreground">
                <div className="flex gap-x-4">
                  <dt className="flex-none">
                    <span className="sr-only">Address</span>
                    <MapPin
                      className="h-7 w-6 text-primary"
                      aria-hidden="true"
                    />
                  </dt>
                  <dd>{locationDetails.address}</dd>
                </div>
                <div className="flex gap-x-4">
                  <dt className="flex-none">
                    <span className="sr-only">Hours</span>
                    <Clock
                      className="h-7 w-6 text-primary"
                      aria-hidden="true"
                    />
                  </dt>
                  <dd className="whitespace-pre-line">
                    {locationDetails.hours}
                  </dd>
                </div>
                <div className="flex gap-x-4">
                  <dt className="flex-none">
                    <span className="sr-only">Telephone</span>
                    <Phone
                      className="h-7 w-6 text-primary"
                      aria-hidden="true"
                    />
                  </dt>
                  <dd>
                    <a
                      className="hover:text-primary"
                      href={`tel:${locationDetails.phone}`}
                    >
                      {locationDetails.phone}
                    </a>
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-foreground">
                Location Features
              </h3>
              <ul className="mt-6 space-y-4">
                {locationDetails.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Truck className="mr-2 h-5 w-5 flex-shrink-0 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10 rounded-xl bg-background p-8 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground">
                  Directions
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Our warehouse is conveniently located just off Highway 31,
                  with easy access from I-465. Look for the blue EboxSecure sign
                  at the entrance.
                </p>
                <p className="mt-4 text-muted-foreground">
                  Parking is available in front of the building, and the
                  entrance is wheelchair accessible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
