"use server";

import { redirect } from "next/navigation";
import { Plan } from "@/types/subscription";
import { currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";

import { TIER_SUBSCRIPTIONS } from "@ebox/client-api";

import { getCurrentSubscriptionStatus } from "../lib/get-subscription-data";

export async function downgradeSubscription(targetTier: Plan) {
  const user = await currentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  const currentStatus = await getCurrentSubscriptionStatus();
  console.log("Current status:", currentStatus.status);
  console.log("Current status:", currentStatus.subscriptionId);

  // Validate that user has an active subscription
  if (currentStatus.status !== "active" || !currentStatus.subscriptionId) {
    throw new Error("No active subscription found to downgrade");
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
    // Retrieve current subscription with schedule information
    const currentSubscription = await stripe.subscriptions.retrieve(
      currentStatus.subscriptionId,
      {
        expand: ["items.data.price", "schedule"],
      },
    );

    if (!currentStatus.currentPeriodEnd) {
      throw new Error("Current period end not found");
    }

    const effectiveDate = new Date(currentStatus.currentPeriodEnd * 1000);
    console.log("Downgrade will take effect:", effectiveDate.toISOString());

    // Get target tier pricing
    const targetLookupKeys = TIER_SUBSCRIPTIONS[targetTier] as string[];
    const targetPrices = await stripe.prices.list({
      lookup_keys: targetLookupKeys,
    });

    // Build subscription items for target tier (handles usage meters)
    const targetSubscriptionItems = targetLookupKeys.map((key) => {
      const price = targetPrices.data.find((p) => p.lookup_key === key);
      if (!price) {
        throw new Error(`Price not found for lookup key: ${key}`);
      }

      // For metered usage (like package holding/allowance), don't specify quantity
      if (price.recurring?.usage_type === "metered") {
        return { price: price.id };
      }

      // For regular subscriptions, include quantity
      return { price: price.id, quantity: 1 };
    });

    console.log("Target subscription items:", targetSubscriptionItems);

    if (currentSubscription.schedule) {
      const scheduleId =
        typeof currentSubscription.schedule === "string"
          ? currentSubscription.schedule
          : currentSubscription.schedule.id;

      // Get the current schedule to preserve existing phase structure
      const currentSchedule =
        await stripe.subscriptionSchedules.retrieve(scheduleId);
      const currentPhase = currentSchedule.phases[0];

      await stripe.subscriptionSchedules.update(scheduleId, {
        phases: [
          {
            items: currentSubscription.items.data.map((item) => ({
              price: item.price.id,
              quantity: item.quantity || undefined,
            })),
            start_date: currentPhase?.start_date,
            end_date: currentStatus.currentPeriodEnd,
            proration_behavior: "none",
          },
          {
            items: targetSubscriptionItems,
            start_date: currentStatus.currentPeriodEnd,
            proration_behavior: "none",
          },
        ],
      });

      console.log("Updated schedule with downgrade");
    } else {
      // Create new schedule from existing subscription
      const newSchedule = await stripe.subscriptionSchedules.create({
        from_subscription: currentStatus.subscriptionId,
      });

      await stripe.subscriptionSchedules.update(newSchedule.id, {
        end_behavior: "release",
        phases: [
          {
            items: currentSubscription.items.data.map((item) => ({
              price: item.price.id,
              quantity: item.quantity || undefined,
            })),
            start_date: newSchedule.phases[0]?.start_date,
            end_date: currentStatus.currentPeriodEnd,
            proration_behavior: "none",
          },
          {
            items: targetSubscriptionItems,
            start_date: currentStatus.currentPeriodEnd,
            proration_behavior: "none",
          },
        ],
      });
    }

    return {
      success: true,
      type: "downgrade_scheduled",
      message: `Downgrade to ${targetTier} scheduled for next billing cycle`,
      effectiveDate,
    };
  } catch (error) {
    console.error("Error scheduling downgrade:", error);

    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Stripe error: ${error.message}`);
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to schedule downgrade: ${errorMessage}`);
  }
}
