"use server";

import { Plan } from "@/types/subscription";
import { currentUser } from "@clerk/nextjs/server";

import { createStripeSession } from "../lib/create-stripe-session";
import { getCurrentSubscriptionStatus } from "../lib/get-subscription-data";
import { getPlanAction } from "../utils/subscription-plan-helpers";
import { upgradeSubscription } from "./upgrade-subscription";

export async function handleSubscription(lookupKey: Plan) {
  const user = await currentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  const currentStatus = await getCurrentSubscriptionStatus();

  // Validate subscription state
  if (currentStatus.status !== "active" && currentStatus.status !== "none") {
    throw new Error("Cannot modify subscription in current state");
  }

  // Validate that the user current subscription is not the same one they're trying to subscribe to
  if (currentStatus.plan === lookupKey) {
    throw new Error("You are already subscribed to this plan");
  }

  // Determine if this is an upgrade, downgrade, or new subscription
  const planAction = getPlanAction(currentStatus.plan, lookupKey);

  // Handle upgrades with prorated billing
  if (planAction === "upgrade") {
    const result = await upgradeSubscription(lookupKey);
    // Return success URL instead of redirect URL for upgrades
    return `${process.env.NEXT_PUBLIC_URL || "https://758bf86740a4.ngrok-free.app"}/success`;
  }

  // For new subscriptions and downgrades, use the existing checkout flow
  return await createStripeSession(lookupKey);
}
