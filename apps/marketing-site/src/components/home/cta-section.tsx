import Link from "next/link";

import { Button } from "@ebox/ui/button";

import { Container } from "../ui/container";

export function CTASection() {
  return (
    <div className="bg-primary">
      <Container className="py-24 sm:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to secure your deliveries?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-foreground/90">
            Start your free trial today and experience the convenience of secure
            package delivery with EboxSecure.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button
              asChild
              size="lg"
              className="bg-white text-primary hover:bg-white/90"
            >
              <Link href="https://app.eboxsecure.com">Go to app</Link>
            </Button>
            <Button
              asChild
              variant="link"
              className="text-white hover:text-white/90"
            >
              <Link href="/contact">
                Contact Sales <span aria-hidden="true">→</span>
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
