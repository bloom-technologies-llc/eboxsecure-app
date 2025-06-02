import { env } from "@/env";

import { Container } from "@ebox/ui/container";

export function LocationsMap() {
  const locationAddress = "1964 Rhettsbury St, Carmel, IN 46032";
  return (
    <div id="current-locations" className="bg-background py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Current Service Area
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Carmel, Indiana Location
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Our flagship warehouse location provides secure package delivery
            services to the Carmel, Indiana area. Explore our interactive map to
            find directions and details.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          {/* Map placeholder - in a real implementation, this would be an interactive map */}
          <div className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-muted shadow-lg">
            <div className="flex h-full flex-col items-center justify-center text-center">
              <iframe
                width="100%"
                height="100%"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/place?key=${env.NEXT_PUBLIC_MAPS_EMBED_API_KEY}&q=${locationAddress}`}
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
