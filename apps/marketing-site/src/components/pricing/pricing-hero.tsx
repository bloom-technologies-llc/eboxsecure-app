import { Container } from "@ebox/ui/container";

export function PricingHero() {
  return (
    <div className="bg-background pt-24 sm:pt-32">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Choose the plan that works best for your needs. All plans include
            our secure warehouse delivery service with no hidden fees.
          </p>
        </div>
      </Container>
    </div>
  );
}
