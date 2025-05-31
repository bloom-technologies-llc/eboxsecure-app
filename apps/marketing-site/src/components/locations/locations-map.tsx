import { Container } from "@ebox/ui/container";

export function LocationsMap() {
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
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <p className="text-lg font-medium text-foreground">
                Interactive Map
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                In a production environment, this would be an interactive map
                showing the Carmel, Indiana location.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
