import type { Metadata } from "next";
import { FAQCategories } from "@/components/faq/faq-categories";
import { FAQContact } from "@/components/faq/faq-contact";
import { FAQHero } from "@/components/faq/faq-hero";
import { CTASection } from "@/components/home/cta-section";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | EboxSecure",
  description:
    "Find answers to common questions about EboxSecure's secure package delivery service, including how it works, pricing, and technical support.",
};

export default function FAQPage() {
  return (
    <>
      <FAQHero />
      <FAQCategories />
      <FAQContact />
      <CTASection />
    </>
  );
}
