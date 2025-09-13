import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import { currentUser } from "@clerk/nextjs/server";

import { hasValidSubscription } from "@ebox/stripe";

export default async function ProtectPage() {
  const user = await currentUser();

  if (!user) {
    console.error("Request does not have user");
    return false;
  }

  const stripeCustomerId = user.privateMetadata.stripeCustomerId as string;
  if (!stripeCustomerId) {
    return false;
  }

  // Check subscription status first
  const userHasValidSubscription = await hasValidSubscription(stripeCustomerId);

  if (!userHasValidSubscription) {
    redirect("/payment");
  }

  // Then check onboarding status
  const isOnboarded = await api.onboarding.isOnboarded();

  if (!isOnboarded) {
    redirect("/onboarding");
  }
}
