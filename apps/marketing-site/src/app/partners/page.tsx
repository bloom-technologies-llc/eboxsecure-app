import type { Metadata } from "next";
import { CTASection } from "@/components/home/cta-section";
import { PartnerApplication } from "@/components/partners/partner-application";
import { PartnerBenefits } from "@/components/partners/partner-benefits";
import { PartnerCaseStudies } from "@/components/partners/partner-case-studies";
import { PartnerHero } from "@/components/partners/partner-hero";
import { PartnerShowcase } from "@/components/partners/partner-showcase";

export const metadata: Metadata = {
  title: "Retail Partners | EboxSecure",
  description:
    "Join EboxSecure's retail partner network to offer secure package delivery solutions to your customers. Learn about partnership benefits and application process.",
};

export default function PartnersPage() {
  return (
    <>
      <PartnerHero />
      <PartnerShowcase />
      <PartnerBenefits />
      <PartnerCaseStudies />
      <PartnerApplication />
      <CTASection />
    </>
  );
}
