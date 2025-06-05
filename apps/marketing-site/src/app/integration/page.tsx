import type { Metadata } from "next";
import { CTASection } from "@/components/home/cta-section";
import { IntegrationHero } from "@/components/integration/integration-hero";
import { IntegrationProcess } from "@/components/integration/integration-process";
import { IntegrationRequirements } from "@/components/integration/integration-requirements";
import { IntegrationSupport } from "@/components/integration/integration-support";
import { IntegrationTechnical } from "@/components/integration/integration-technical";

export const metadata: Metadata = {
  title: "Integration Guide | EboxSecure for Businesses",
  description:
    "Technical overview of EboxSecure's Shopify app integration, API details, and implementation guide for retailers and businesses.",
};

export default function IntegrationPage() {
  return (
    <>
      <IntegrationHero />
      <IntegrationProcess />
      <IntegrationTechnical />
      <IntegrationRequirements />
      <IntegrationSupport />
      <CTASection />
    </>
  );
}
