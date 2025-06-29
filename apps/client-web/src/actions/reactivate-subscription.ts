"use server";

import { currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";

import { getCurrentSubscriptionStatus } from "../lib/get-subscription-data";
import { syncCustomerData } from "../lib/sync-customer-data";

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

  // calling this instead of letting webhook handle it for ui update, pls lmk if bad practice
  const customerId = user.privateMetadata.stripeCustomerId as string;
  if (customerId) {
    await syncCustomerData(customerId);
  }

  return { success: true };
}
