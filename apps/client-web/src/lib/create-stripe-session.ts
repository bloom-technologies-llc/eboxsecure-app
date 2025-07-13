"use server";

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";

import { kv } from "./redis";

// Mapping of tiers to their associated metering subscriptions
const TIER_SUBSCRIPTIONS = {
  basic: ["basic", "basic_holding", "basic_allowance"],
  basic_plus: ["basic_plus", "basic_plus_holding", "basic_plus_allowance"],
  premium: ["premium", "premium_holding", "premium_allowance"],
  business_pro: [
    "business_pro",
    "business_pro_holding",
    "business_pro_allowance",
  ],
};

export async function createStripeSession(
  lookupKey: "basic" | "basic_plus" | "premium" | "business_pro",
) {
  const user = await currentUser();

  if (!user) {
    throw new Error("User not found");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  let stripeCustomerId = user.privateMetadata.stripeCustomerId as string;

  // Create a new Stripe customer if this user doesn't have one
  if (!stripeCustomerId) {
    const newCustomer = await stripe.customers.create({
      email: user.primaryEmailAddress?.emailAddress,
      metadata: {
        userId: user.id, // DO NOT FORGET THIS
      },
    });

    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(user.id, {
      privateMetadata: {
        stripeCustomerId: newCustomer.id,
      },
    });

    await kv.set(`stripe:user:${user.id}`, newCustomer.id);
    stripeCustomerId = newCustomer.id;
  }

  // Get all lookup keys for the selected tier (main tier + metering subscriptions)
  const lookupKeys = TIER_SUBSCRIPTIONS[lookupKey] as string[];

  const prices = await stripe.prices.list({
    lookup_keys: lookupKeys,
    expand: ["data.product"],
  });

  // Create line items for all prices associated with this tier
  const lineItems = lookupKeys.map((key) => {
    const price = prices.data.find((price) => price.lookup_key === key);
    if (!price) {
      throw new Error(`Price not found for lookup key: ${key}`);
    }

    // For metered subscriptions, don't include quantity
    if (price.recurring?.usage_type === "metered") {
      return { price: price.id };
    }

    // For regular subscriptions, include quantity
    return { price: price.id, quantity: 1 };
  });

  const session = await stripe.checkout.sessions.create({
    billing_address_collection: "auto",
    customer: stripeCustomerId,
    line_items: lineItems,
    mode: "subscription",
    success_url: "https://758bf86740a4.ngrok-free.app/success",
  });

  if (!session.url) {
    throw new Error("session url not found");
  }

  return session.url;
}
