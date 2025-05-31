import { Container } from "@ebox/ui/container";

export function ContactHero() {
  return (
    <div className="bg-background pt-24 sm:pt-32">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Contact Us
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Have questions about EboxSecure? Our team is here to help. Whether
            you're interested in our services, need support, or want to explore
            partnership opportunities, we'd love to hear from you.
          </p>
        </div>
      </Container>
    </div>
  );
}
