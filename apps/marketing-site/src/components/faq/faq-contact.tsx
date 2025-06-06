import Link from "next/link";
import { Mail, MessageSquare, Phone } from "lucide-react";

import { Button } from "@ebox/ui/button";
import { Container } from "@ebox/ui/container";

export function FAQContact() {
  return (
    <div className="bg-muted/50 py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Still Have Questions?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Our support team is here to help. Reach out to us through any of
            these channels.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-2">
          <div className="flex flex-col items-center rounded-xl bg-background p-8 text-center shadow-sm">
            <Mail className="h-10 w-10 text-primary" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              Email Support
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Send us an email and we'll respond within 24 hours.
            </p>
            <Button asChild className="mt-6">
              <Link href="mailto:support@eboxsecure.com">
                support@eboxsecure.com
              </Link>
            </Button>
          </div>

          <div className="flex flex-col items-center rounded-xl bg-background p-8 text-center shadow-sm">
            <Phone className="h-10 w-10 text-primary" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              Phone Support
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Available Monday-Friday, 9am-5pm EST.
            </p>
            <Button asChild className="mt-6">
              <Link href="tel:+13175551234">(317) 555-1234</Link>
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
