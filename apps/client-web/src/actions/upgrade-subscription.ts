"use server";

import { redirect } from "next/navigation";
import { Plan } from "@/types/subscription";
import { currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";

import { TIER_SUBSCRIPTIONS } from "@ebox/client-api";

import { getCurrentSubscriptionStatus } from "../lib/get-subscription-data";

export async function upgradeSubscription(targetTier: Plan) {
  const user = await currentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  const currentStatus = await getCurrentSubscriptionStatus();

  // Validate that user has an active subscription
  if (currentStatus.status !== "active" || !currentStatus.subscriptionId) {
    throw new Error("No active subscription found to upgrade");
  }

  // Validate that this is actually a plan change
  if (currentStatus.plan === targetTier) {
    throw new Error("You are already subscribed to this plan");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const stripeCustomerId = user.privateMetadata.stripeCustomerId as string;

  if (!stripeCustomerId) {
    redirect("/payment");
  }

  try {
    // Set proration date to this moment for consistency
    const proration_date = Math.floor(Date.now() / 1000);

    // Get current subscription details
    const currentSubscription = await stripe.subscriptions.retrieve(
      currentStatus.subscriptionId,
      {
        expand: ["items.data.price"],
      },
    );

    console.log(
      "Current subscription:",
      JSON.stringify(currentSubscription, null, 2),
    );

    // Get target tier pricing
    const targetLookupKeys = TIER_SUBSCRIPTIONS[targetTier] as string[];
    const targetPrices = await stripe.prices.list({
      lookup_keys: targetLookupKeys,
    });

    console.log("Target prices:", targetPrices.data);

    // Map existing subscription items to new prices
    // This follows the pattern from Stripe docs: items should have id and price
    const subscriptionItems = currentSubscription.items.data.map(
      (item, index) => {
        // Find corresponding target price by index or lookup key
        const targetPrice = targetPrices.data[index];
        if (!targetPrice) {
          throw new Error(
            `No target price found for subscription item ${item.id}`,
          );
        }

        return {
          id: item.id,
          price: targetPrice.id,
          // Only include quantity for non-metered items
          ...(targetPrice.recurring?.usage_type !== "metered" && {
            quantity: item.quantity || 1,
          }),
        };
      },
    );

    // if user has any downgrades scheduled, cancel them
    const schedules = await stripe.subscriptionSchedules.list({
      customer: stripeCustomerId,
    });

    if (schedules.data.length > 0) {
      for (const schedule of schedules.data) {
        if (schedule.status === "active") {
          await stripe.subscriptionSchedules.release(schedule.id);
        }
      }
    }

    const updatedSubscription = await stripe.subscriptions.update(
      currentStatus.subscriptionId,
      {
        items: subscriptionItems,
        proration_behavior: "always_invoice",
        proration_date: proration_date,
      },
    );

    return {
      success: true,
      type: "upgrade_completed",
      message: `Successfully upgraded to ${targetTier}`,
      subscription: updatedSubscription,
    };
  } catch (error) {
    console.error("Error processing upgrade:", error);

    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Stripe error: ${error.message}`);
    }

    // Show the actual error details for debugging
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to process upgrade: ${errorMessage}`);
  }
}
