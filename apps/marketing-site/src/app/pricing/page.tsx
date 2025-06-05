import type { Metadata } from "next";
import { CTASection } from "@/components/home/cta-section";
import { PricingComparison } from "@/components/pricing/pricing-comparison";
import { PricingFAQ } from "@/components/pricing/pricing-faq";
import { PricingHero } from "@/components/pricing/pricing-hero";
import { PricingTiers } from "@/components/pricing/pricing-tiers";

export const metadata: Metadata = {
  title: "Pricing | EboxSecure",
  description:
    "Transparent pricing plans for EboxSecure's secure package delivery service. Choose from Basic, Basic+, Premium, and Business Pro tiers to fit your needs.",
};

export default function PricingPage() {
  return (
    <>
      <PricingHero />
      <PricingTiers />
      <PricingComparison />
      <PricingFAQ />
      <CTASection />
    </>
  );
}
