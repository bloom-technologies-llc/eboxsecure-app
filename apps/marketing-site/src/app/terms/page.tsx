import type { Metadata } from "next";
import { LegalHero } from "@/components/legal/legal-hero";
import { TermsContent } from "@/components/legal/terms-content";

export const metadata: Metadata = {
  title: "Terms & Conditions | EboxSecure",
  description:
    "EboxSecure's Terms & Conditions outlining service description, user responsibilities, package handling, billing terms, and more.",
};

export default function TermsPage() {
  return (
    <>
      <LegalHero
        title="Terms & Conditions"
        description="Last updated: January 1, 2024"
      />
      <TermsContent />
    </>
  );
}
