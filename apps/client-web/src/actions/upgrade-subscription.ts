"use server";

import { Plan } from "@/types/subscription";
import { currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";

import { TIER_SUBSCRIPTIONS } from "@ebox/client-api";

import { getCurrentSubscriptionStatus } from "../lib/get-subscription-data";
import { syncCustomerData } from "../lib/sync-customer-data";

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

  // Validate that this is actually an upgrade
  if (currentStatus.plan === targetTier) {
    throw new Error("You are already subscribed to this plan");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  try {
    // Get the current subscription details
    const subscription = await stripe.subscriptions.retrieve(
      currentStatus.subscriptionId,
      {
        expand: ["items.data.price"],
      },
    );

    // Get all new lookup keys for the target tier
    const newLookupKeys = TIER_SUBSCRIPTIONS[targetTier];

    const newPrices = await stripe.prices.list({
      lookup_keys: newLookupKeys,
      expand: ["data.product"],
    });

    // Build the subscription items update
    const subscriptionItems = subscription.items.data.map((item) => {
      const currentPrice = item.price;

      // Find the corresponding new price based on the current price's lookup key pattern
      let newPrice;
      if (currentPrice.lookup_key?.includes("_holding")) {
        // Find the new holding subscription
        newPrice = newPrices.data.find((p) =>
          p.lookup_key?.includes("_holding"),
        );
      } else if (currentPrice.lookup_key?.includes("_allowance")) {
        // Find the new allowance subscription
        newPrice = newPrices.data.find((p) =>
          p.lookup_key?.includes("_allowance"),
        );
      } else {
        // This is the main subscription item (no underscore suffix)
        newPrice = newPrices.data.find(
          (p) =>
            p.lookup_key &&
            !p.lookup_key.includes("_holding") &&
            !p.lookup_key.includes("_allowance"),
        );
      }

      if (!newPrice) {
        throw new Error(
          `Could not find new price for lookup key pattern: ${currentPrice.lookup_key}`,
        );
      }

      return {
        id: item.id,
        price: newPrice.id,
        quantity: item.quantity,
      };
    });

    // Update the subscription with prorated billing
    const updatedSubscription = await stripe.subscriptions.update(
      currentStatus.subscriptionId,
      {
        items: subscriptionItems,
        proration_behavior: "always_invoice", // This ensures immediate invoicing for prorated charges
      },
    );

    // Sync customer data to update our local cache
    const customerId = user.privateMetadata.stripeCustomerId as string;
    if (customerId) {
      await syncCustomerData(customerId);
    }

    return {
      success: true,
      subscriptionId: updatedSubscription.id,
      newPlan: targetTier,
    };
  } catch (error) {
    console.error("Error upgrading subscription:", error);

    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Stripe error: ${error.message}`);
    }

    throw new Error("Failed to upgrade subscription");
  }
}
