import { redirect } from "next/navigation";
import { api } from "@/trpc/server";

import { hasValidSubscription } from "@ebox/client-api";

import PortraitPhotoUpload from "./PortraitPhotoUpload";

export default async function Page() {
  // Check subscription status first
  const userHasValidSubscription = await hasValidSubscription();

  if (!userHasValidSubscription) {
    redirect("/payment");
  }

  // Then check onboarding status
  const isOnboarded = await api.onboarding.isOnboarded();
  if (isOnboarded) {
    redirect("/");
  }

  return (
    <div className="flex h-screen w-full flex-col items-center gap-8 pt-24">
      <PortraitPhotoUpload />
    </div>
  );
}
