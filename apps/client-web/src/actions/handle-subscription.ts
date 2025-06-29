"use server";

import { currentUser } from "@clerk/nextjs/server";

import { createStripeSession } from "../lib/create-stripe-session";
import { getCurrentSubscriptionStatus } from "../lib/get-subscription-data";

export async function handleSubscription(lookupKey: string) {
  const user = await currentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  const currentStatus = await getCurrentSubscriptionStatus();

  // Validate upgrade path
  if (currentStatus.status !== "active" && currentStatus.status !== "none") {
    throw new Error("Cannot upgrade subscription in current state");
  }

  // Validate that the user current subscription is not the same one they're trying to upgrade to
  if (currentStatus.plan === lookupKey) {
    throw new Error("You are already subscribed to this plan");
  }

  return await createStripeSession(lookupKey as any);
}
