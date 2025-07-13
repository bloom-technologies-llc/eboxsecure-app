import { redirect } from "next/navigation";
import { checkValidSubscription } from "@/lib/subscription-utils";
import { api } from "@/trpc/server";

import PortraitPhotoUpload from "./PortraitPhotoUpload";

export default async function Page() {
  // Check subscription status first
  const hasValidSubscription = await checkValidSubscription();

  if (!hasValidSubscription) {
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
