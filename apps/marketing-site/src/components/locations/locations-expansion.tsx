import { Container } from "../ui/container";

const expansionMarkets = [
  {
    city: "Indianapolis",
    state: "IN",
    status: "Coming Q1 2024",
    description:
      "Expanding our reach to serve the greater Indianapolis metropolitan area.",
  },
  {
    city: "Chicago",
    state: "IL",
    status: "Coming Q2 2024",
    description:
      "Our first out-of-state location will serve the Chicago metropolitan area.",
  },
  {
    city: "Cincinnati",
    state: "OH",
    status: "Coming Q3 2024",
    description:
      "Expanding eastward to serve the Cincinnati metropolitan area.",
  },
  {
    city: "Louisville",
    state: "KY",
    status: "Coming Q4 2024",
    description:
      "Bringing secure package delivery to the Louisville metropolitan area.",
  },
  {
    city: "Columbus",
    state: "OH",
    status: "Planned 2025",
    description:
      "Future expansion plans include the Columbus metropolitan area.",
  },
  {
    city: "Detroit",
    state: "MI",
    status: "Planned 2025",
    description:
      "Future expansion plans include the Detroit metropolitan area.",
  },
];

export function LocationsExpansion() {
  return (
    <div id="expansion-plans" className="bg-background py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Growing Network
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Expansion Plans
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            We're rapidly expanding to bring EboxSecure's secure package
            delivery to more markets. Check out our upcoming locations and
            expansion timeline.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-7xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {expansionMarkets.map((market) => (
              <div
                key={`${market.city}-${market.state}`}
                className="rounded-xl bg-muted/50 p-8 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-foreground">
                    {market.city}, {market.state}
                  </h3>
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    {market.status}
                  </span>
                </div>
                <p className="mt-4 text-muted-foreground">
                  {market.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-xl bg-muted/30 p-8">
            <h3 className="text-xl font-semibold text-foreground">
              Interested in bringing EboxSecure to your area?
            </h3>
            <p className="mt-4 text-muted-foreground">
              We're always looking for new markets to expand into. If you'd like
              to see EboxSecure in your area, let us know! We consider customer
              demand when planning our expansion strategy.
            </p>
            <p className="mt-4 text-muted-foreground">
              Contact us at{" "}
              <a
                href="mailto:expansion@eboxsecure.com"
                className="text-primary hover:underline"
              >
                expansion@eboxsecure.com
              </a>{" "}
              to express interest in your location.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
