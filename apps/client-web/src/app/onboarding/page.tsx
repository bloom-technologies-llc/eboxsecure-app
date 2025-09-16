import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import { currentUser } from "@clerk/nextjs/server";

import { getStripeCustomerId, hasValidSubscription } from "@ebox/stripe";

import PortraitPhotoUpload from "./PortraitPhotoUpload";

export default async function Page() {
  const user = await currentUser();

  if (!user) {
    console.error("Request does not have user");
    return false;
  }

  const stripeCustomerId = await getStripeCustomerId(user.id);
  if (!stripeCustomerId) {
    return false;
  }

  const userHasValidSubscription = await hasValidSubscription(stripeCustomerId);

  if (!userHasValidSubscription) {
    redirect("/payment");
  }

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
