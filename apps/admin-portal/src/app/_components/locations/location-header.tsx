"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import type { RouterOutputs } from "@ebox/admin-api";

type LocationData = RouterOutputs["locations"]["getLocationDetails"];

interface LocationHeaderProps {
  location: LocationData;
}

export default function LocationHeader({ location }: LocationHeaderProps) {
  const router = useRouter();

  return (
    <div
      className="flex cursor-pointer items-center gap-x-2"
      onClick={() => router.push("/locations")}
    >
      <ArrowLeft className="h-4 w-4" />
      <p>{location.name}</p>
    </div>
  );
}
