import { Container } from "../ui/container";

// In a real implementation, these would be actual partner logos
const partners = [
  { name: "Fashion Retailer", logo: "/placeholder-logo-1.svg" },
  { name: "Electronics Store", logo: "/placeholder-logo-2.svg" },
  { name: "Home Goods", logo: "/placeholder-logo-3.svg" },
  { name: "Specialty Shop", logo: "/placeholder-logo-4.svg" },
  { name: "Outdoor Supplier", logo: "/placeholder-logo-5.svg" },
  { name: "Luxury Boutique", logo: "/placeholder-logo-6.svg" },
];

export function PartnerShowcase() {
  return (
    <div className="bg-background py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Our Network
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Current Shopify App Partners
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Join these forward-thinking retailers who are already offering
            EboxSecure's secure delivery option to their customers.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-7xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="flex flex-col items-center justify-center"
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted/50">
                  <div className="text-sm text-muted-foreground">Logo</div>
                </div>
                <p className="mt-4 text-center text-sm font-medium text-foreground">
                  {partner.name}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <p className="text-muted-foreground">
              And many more retailers across various industries...
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
