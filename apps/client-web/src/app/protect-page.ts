import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import { currentUser } from "@clerk/nextjs/server";

import { getStripeCustomerId, hasValidSubscription } from "@ebox/stripe";

export default async function ProtectPage() {
  const user = await currentUser();
  if (!user) {
    return null;
  }
  const stripeCustomerId = await getStripeCustomerId(user.id);

  if (!stripeCustomerId) {
    redirect("/payment");
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
