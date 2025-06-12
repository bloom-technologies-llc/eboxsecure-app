import type { Metadata } from "next";
import { LegalHero } from "@/components/legal/legal-hero";
import { PrivacyContent } from "@/components/legal/privacy-content";

export const metadata: Metadata = {
  title: "Privacy Policy | EboxSecure",
  description:
    "EboxSecure's Privacy Policy detailing how we collect, use, and protect your personal information when using our secure package delivery service.",
};

export default function PrivacyPage() {
  return (
    <>
      <LegalHero
        title="Privacy Policy"
        description="Last updated: June 12, 2025"
      />
      <PrivacyContent />
    </>
  );
}
