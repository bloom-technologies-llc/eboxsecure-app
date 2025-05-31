import type { Metadata } from "next";
import { CustomerBenefits } from "@/components/customers/customer-benefits";
import { CustomerFAQ } from "@/components/customers/customer-faq";
import { CustomerHero } from "@/components/customers/customer-hero";
import { CustomerHowItWorks } from "@/components/customers/customer-how-it-works";
import { CTASection } from "@/components/home/cta-section";

export const metadata: Metadata = {
  title: "For Customers | How EboxSecure Works",
  description:
    "Learn how EboxSecure provides secure package delivery solutions for customers, protecting your deliveries and giving you peace of mind.",
};

export default function CustomersPage() {
  return (
    <>
      <CustomerHero />
      <CustomerHowItWorks />
      <CustomerBenefits />
      <CustomerFAQ />
      <CTASection />
    </>
  );
}
