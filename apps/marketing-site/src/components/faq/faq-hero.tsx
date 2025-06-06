import { Container } from "@ebox/ui/container";

export function FAQHero() {
  return (
    <div className="bg-background pt-24 sm:pt-32">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Find answers to common questions about EboxSecure's secure package
            delivery service. If you can't find what you're looking for, feel
            free to contact our support team.
          </p>
        </div>
      </Container>
    </div>
  );
}
