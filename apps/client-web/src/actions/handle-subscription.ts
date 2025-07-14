"use server";

import { Plan } from "@/types/subscription";
import { currentUser } from "@clerk/nextjs/server";

import { createStripeSession } from "../lib/create-stripe-session";
import { getCurrentSubscriptionStatus } from "../lib/get-subscription-data";
import { getPlanAction } from "../utils/subscription-plan-helpers";
import { downgradeSubscription } from "./downgrade-subscription";
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
  console.log("\n\n\n Plan action: ", planAction, "\n\n\n");

  // Handle upgrades with prorated checkout session
  if (planAction === "upgrade") {
    return await upgradeSubscription(lookupKey);
  }

  // Handle downgrades by scheduling them for next billing cycle
  if (planAction === "downgrade") {
    console.log("\n\n\n Downgrading subscription \n\n\n");
    const result = await downgradeSubscription(lookupKey);

    // Return a special identifier for downgrades to trigger confirmation dialog
    return {
      type: "downgrade_scheduled",
      data: result,
    };
  }

  // For new subscriptions, use the existing checkout flow
  return await createStripeSession(lookupKey);
}
