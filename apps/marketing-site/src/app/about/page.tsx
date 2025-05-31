import type { Metadata } from "next";
import { AboutHero } from "@/components/about/about-hero";
import { AboutInnovation } from "@/components/about/about-innovation";
import { AboutMarkets } from "@/components/about/about-markets";
import { AboutMission } from "@/components/about/about-mission";
import { AboutTeam } from "@/components/about/about-team";
import { CTASection } from "@/components/home/cta-section";

export const metadata: Metadata = {
  title: "About EboxSecure | Secure Package Delivery Solutions",
  description:
    "Learn about EboxSecure's mission, team, and innovative approach to secure package delivery and logistics solutions.",
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <AboutMission />
      <AboutInnovation />
      <AboutTeam />
      <AboutMarkets />
      <CTASection />
    </>
  );
}
