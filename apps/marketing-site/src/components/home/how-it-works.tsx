import Image from "next/image";
import Link from "next/link";

import { Button } from "@ebox/ui/button";

import { Container } from "../ui/container";

const steps = [
  {
    id: "01",
    name: "Get Your Virtual Address",
    description:
      "Sign up for EboxSecure and receive your unique virtual address (123 Main St, UID-12345, Carmel IN) to use at any retailer checkout.",
    imageSrc: "/placeholder-image-1.jpg",
  },
  {
    id: "02",
    name: "Shop Anywhere",
    description:
      "Use your virtual address at any retailer, or select EboxSecure at checkout with our Shopify app integration.",
    imageSrc: "/placeholder-image-2.jpg",
  },
  {
    id: "03",
    name: "Secure Delivery",
    description:
      "Your packages are delivered to our secure warehouse location instead of being left unattended at your doorstep.",
    imageSrc: "/placeholder-image-3.jpg",
  },
  {
    id: "04",
    name: "Pickup When Ready",
    description:
      "Receive notifications when your packages arrive and pick them up at your convenience during extended business hours.",
    imageSrc: "/placeholder-image-4.jpg",
  },
];

export function HowItWorks() {
  return (
    <div className="bg-muted/50 py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Simple Process
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How EboxSecure Works
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Our streamlined process makes secure package delivery easy for
            businesses of all sizes.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2">
            {steps.map((step, stepIdx) => (
              <div key={step.id} className="flex flex-col">
                <div className="flex items-center gap-x-4 text-base font-semibold leading-7 text-foreground">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <span className="text-sm text-white">{step.id}</span>
                  </div>
                  <h3>{step.name}</h3>
                </div>
                <div className="mt-4 overflow-hidden rounded-lg">
                  <div className="relative h-64 w-full">
                    {/* Placeholder for actual images */}
                    <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
                      Image Placeholder
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-base leading-7 text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 flex justify-center">
            <Button asChild size="lg">
              <Link href="/for-customers">Learn More About How It Works</Link>
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
