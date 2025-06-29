"use server";

import { currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";

import { getCurrentSubscriptionStatus } from "../lib/get-subscription-data";
import { syncCustomerData } from "../lib/sync-customer-data";

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

  const customerId = user.privateMetadata.stripeCustomerId as string;
  if (customerId) {
    await syncCustomerData(customerId);
  }

  return { success: true };
}
