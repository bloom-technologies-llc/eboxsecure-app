import type { Metadata } from "next";
import { BusinessBenefits } from "@/components/businesses/business-benefits";
import { BusinessHero } from "@/components/businesses/business-hero";
import { BusinessHowItWorks } from "@/components/businesses/business-how-it-works";
import { BusinessIntegration } from "@/components/businesses/business-integration";
import { BusinessTestimonials } from "@/components/businesses/business-testimonials";
import { CTASection } from "@/components/home/cta-section";

export const metadata: Metadata = {
  title: "For Businesses | EboxSecure Delivery Solutions",
  description:
    "Discover how EboxSecure helps retailers and businesses improve delivery success rates, reduce costs, and enhance customer satisfaction.",
};

export default function BusinessesPage() {
  return (
    <>
      <BusinessHero />
      <BusinessHowItWorks />
      <BusinessBenefits />
      <BusinessIntegration />
      <BusinessTestimonials />
      <CTASection />
    </>
  );
}
