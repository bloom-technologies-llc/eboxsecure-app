import type { Metadata } from "next";
import { CTASection } from "@/components/home/cta-section";
import { LocationsDetails } from "@/components/locations/locations-details";
import { LocationsExpansion } from "@/components/locations/locations-expansion";
import { LocationsHero } from "@/components/locations/locations-hero";
import { LocationsMap } from "@/components/locations/locations-map";

export const metadata: Metadata = {
  title: "Locations | EboxSecure",
  description:
    "Find EboxSecure warehouse locations near you. Currently serving Carmel, Indiana with plans for expansion to more markets.",
};

export default function LocationsPage() {
  return (
    <>
      <LocationsHero />
      <LocationsMap />
      <LocationsDetails />
      <LocationsExpansion />
      <CTASection />
    </>
  );
}
