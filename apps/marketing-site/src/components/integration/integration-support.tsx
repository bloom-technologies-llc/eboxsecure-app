import Link from "next/link";
import { HeadphonesIcon, MessageSquare, Users } from "lucide-react";

import { Button } from "@ebox/ui/button";
import { Container } from "@ebox/ui/container";

const supportOptions = [
  {
    title: "Dedicated Onboarding",
    description:
      "Business and Enterprise customers receive dedicated onboarding support from our technical team to ensure a smooth integration.",
    icon: Users,
    cta: "Contact Sales",
    link: "/contact",
  },
  {
    title: "Developer Support",
    description:
      "Our developer support team is available via email and chat to assist with technical questions and integration challenges.",
    icon: MessageSquare,
    cta: "Contact Support",
    link: "/support",
  },
  {
    title: "Technical Documentation",
    description:
      "Comprehensive documentation, code samples, and integration guides are available in our developer portal.",
    icon: HeadphonesIcon,
    cta: "View Documentation",
    link: "/documentation",
  },
];

export function IntegrationSupport() {
  return (
    <div className="bg-muted/50 py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Implementation Support
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            We're Here to Help
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Our team is committed to ensuring your integration is successful. We
            offer various support options to assist you throughout the process.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {supportOptions.map((option) => (
            <div
              key={option.title}
              className="flex flex-col rounded-xl bg-background p-8 shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
                <option.icon
                  className="h-6 w-6 text-white"
                  aria-hidden="true"
                />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-foreground">
                {option.title}
              </h3>
              <p className="mt-2 flex-grow text-base text-muted-foreground">
                {option.description}
              </p>
              <div className="mt-6">
                <Button asChild variant="outline" className="w-full">
                  <Link href={option.link}>{option.cta}</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-3xl rounded-xl bg-background p-8 shadow-sm">
          <h3 className="text-xl font-semibold text-foreground">
            Integration Timeline
          </h3>
          <p className="mt-2 text-muted-foreground">
            The typical integration process timeline depends on your chosen
            method:
          </p>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start">
              <span className="mr-2 font-medium text-foreground">•</span>
              <span>
                <strong>Shopify App:</strong> 1-2 business days for installation
                and configuration
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 font-medium text-foreground">•</span>
              <span>
                <strong>API Integration:</strong> 2-4 weeks depending on
                complexity and resources
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 font-medium text-foreground">•</span>
              <span>
                <strong>Custom Integration:</strong> 4-8 weeks with dedicated
                support from our team
              </span>
            </li>
          </ul>
          <div className="mt-6 text-center">
            <Button asChild>
              <Link href="/contact">Schedule Integration Consultation</Link>
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
