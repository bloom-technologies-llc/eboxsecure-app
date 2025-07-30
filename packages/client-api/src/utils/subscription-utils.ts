import { currentUser } from "@clerk/nextjs/server";
import { SubscriptionType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import Stripe from "stripe";
import z from "zod";

import { db } from "@ebox/db";
import { kv } from "@ebox/redis-client";

export type SubscriptionData = {
  subscriptionId: string;
  status:
    | "active"
    | "canceled"
    | "past_due"
    | "unpaid"
    | "incomplete"
    | "incomplete_expired"
    | "trialing"
    | "paused"
    | "none";
  priceIds: string[];
  currentPeriodEnd: number;
  currentPeriodStart: number;
  cancelAtPeriodEnd: boolean;
};

// Must match the schema in client-web
export const subscriptionDataSchema = z.object({
  subscriptionId: z.string(),
  status: z.enum([
    "active",
    "canceled",
    "past_due",
    "unpaid",
    "incomplete",
    "incomplete_expired",
    "trialing",
    "paused",
    "none",
  ]),
  priceIds: z.array(z.string()),
  currentPeriodEnd: z.number(),
  currentPeriodStart: z.number(),
  cancelAtPeriodEnd: z.boolean(),
});

// Location limits per subscription tier
const LOCATION_LIMITS: Record<SubscriptionType, number> = {
  BASIC: 3,
  BASIC_PLUS: 25,
  PREMIUM: 75,
  BUSINESS_PRO: Infinity,
};

/**
 *
 * @param priceIds - The multiple price IDs that are associated with a subscription plan
 * @returns The Subscription Type of the price IDs
 */
export async function priceIdsToPlan(priceIds: string[]) {
  if (priceIds.length !== 3) {
    console.error("User must have 3 price IDs to determine subscription tier");
    return null;
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  try {
    // Fetch all three prices from Stripe
    const pricePromises = priceIds.map((priceId) =>
      stripe.prices.retrieve(priceId, { expand: ["product"] }),
    );

    const prices = await Promise.all(pricePromises);

    // Validate that all prices exist
    if (prices.length !== 3) {
      console.error("Could not fetch all three prices from Stripe");
      return null;
    }

    // Extract subscription types from lookup keys
    const subscriptionTypes = prices.map((price) => {
      const lookupKey = price.lookup_key;
      if (!lookupKey) {
        console.error("Price missing lookup key");
        return null;
      }

      let baseType: string;

      if (lookupKey.endsWith("_allowance")) {
        baseType = lookupKey.replace("_allowance", "");
      } else if (lookupKey.endsWith("_overdue_holding")) {
        baseType = lookupKey.replace("_overdue_holding", "");
      } else {
        // Assume it's the base subscription type
        baseType = lookupKey;
      }

      return baseType.toUpperCase();
    });

    // Check if any extraction failed
    if (subscriptionTypes.some((type) => type === null)) {
      console.error(
        "Failed to extract subscription type from one or more lookup keys",
      );
      return null;
    }

    // Validate that all three prices have the same subscription type
    const firstType = subscriptionTypes[0];
    const allSameType = subscriptionTypes.every((type) => type === firstType);

    if (!allSameType) {
      console.error(
        "Subscription type is not the same across all three price lookup keys",
      );
      return null;
    }

    // Map the extracted type to SubscriptionType enum
    const subscriptionTypeMap: Record<string, SubscriptionType> = {
      BASIC: SubscriptionType.BASIC,
      BASIC_PLUS: SubscriptionType.BASIC_PLUS,
      PREMIUM: SubscriptionType.PREMIUM,
      BUSINESS_PRO: SubscriptionType.BUSINESS_PRO,
    };

    const subscriptionType = subscriptionTypeMap[firstType!];

    if (!subscriptionType) {
      console.error(`Unknown subscription type: ${firstType}`);
      return null;
    }

    return subscriptionType;
  } catch (error) {
    console.error("Error fetching prices from Stripe:", error);
    return null;
  }
}

/**
 * Get user's current subscription tier from KV store
 */
export async function getUserSubscriptionTier() {
  const user = await currentUser();

  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User not authenticated",
    });
  }

  const stripeCustomerId = user.privateMetadata.stripeCustomerId as string;

  if (!stripeCustomerId) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message:
        "No Stripe customer ID found. Please set up your subscription first.",
    });
  }

  // Get the customer's subscription data from KV store
  const subscriptionDataKv = await kv.get(
    `stripe:customer:${stripeCustomerId}`,
  );

  const parsedSubData = subscriptionDataSchema.safeParse(subscriptionDataKv);

  if (!parsedSubData.success) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "No subscription data found for user",
    });
  }

  const subscriptionData = parsedSubData.data;
  if (!subscriptionData || !subscriptionData.priceIds) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "No subscription data found for user",
    });
  }

  const subscriptionTier = priceIdsToPlan(subscriptionData.priceIds);

  if (!subscriptionTier) {
    // Unable to determine tier
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "No subscription data found for user",
    });
  }

  return subscriptionTier;
}

/**
 * Check if user can add more favorite locations
 * @param currentFavoriteCount - The current number of favorite locations
 * @param subscriptionTier - The subscription tier of the user
 * @returns An object with the following properties:
 * - canAdd: boolean - Whether the user can add more favorite locations
 * - limit: number - The maximum number of favorite locations the user can have
 * - remaining: number - The number of favorite locations the user can add
 */
export async function canUserAddMoreFavorites(currentFavoriteCount: number) {
  const tier = await getUserSubscriptionTier();

  if (!tier) {
    return {
      canAdd: false,
      limit: 0,
      remaining: 0,
    };
  }
  const limit = getLocationLimit(tier);

  const remaining = limit - currentFavoriteCount;

  return {
    canAdd: remaining > 0,
    limit,
    remaining,
  };
}

export function getLocationLimit(subscriptionTier: SubscriptionType): number {
  return LOCATION_LIMITS[subscriptionTier as keyof typeof LOCATION_LIMITS] || 0;
}
