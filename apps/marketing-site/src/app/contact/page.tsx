import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";
import { ContactHero } from "@/components/contact/contact-hero";
import { ContactInfo } from "@/components/contact/contact-info";

export const metadata: Metadata = {
  title: "Contact EboxSecure | Sales & Support",
  description:
    "Get in touch with EboxSecure for sales inquiries, customer support, or partnership opportunities. We're here to help with your secure package delivery needs.",
};

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <ContactForm />
        <ContactInfo />
      </div>
    </>
  );
}
