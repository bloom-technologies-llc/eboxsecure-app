"use server";

import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";

import { createStripeSession } from "./create-stripe-session";
import { getCurrentSubscriptionStatus } from "./get-subscription-data";

export async function upgradeSubscription(lookupKey: string) {
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

export async function handleUpgradeFormAction(formData: FormData) {
  const lookupKey = formData.get("lookupKey") as string;
  if (!lookupKey) {
    throw new Error("No lookup key provided");
  }

  const url = await upgradeSubscription(lookupKey);
  if (url) {
    redirect(url);
  }
}

export async function cancelSubscription() {
  const user = await currentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  const currentStatus = await getCurrentSubscriptionStatus();

  if (!currentStatus.subscriptionId) {
    throw new Error("No active subscription to cancel");
  }

  if (currentStatus.status !== "active") {
    throw new Error("Subscription is not in an active state");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  // Cancel at period end (soft cancel)
  await stripe.subscriptions.update(currentStatus.subscriptionId, {
    cancel_at_period_end: true,
  });

  return { success: true };
}

export async function reactivateSubscription() {
  const user = await currentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  const currentStatus = await getCurrentSubscriptionStatus();

  if (!currentStatus.subscriptionId) {
    throw new Error("No subscription to reactivate");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  // Remove cancellation
  await stripe.subscriptions.update(currentStatus.subscriptionId, {
    cancel_at_period_end: false,
  });

  return { success: true };
}
