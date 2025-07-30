import { currentUser } from "@clerk/nextjs/server";
import { SubscriptionType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
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

const subscriptionDataSchema = z.object({
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
async function priceIdsToPlan(priceIds: string[]) {
  if (priceIds.length !== 3) {
    console.error("User must have 3 price IDs to determine subscription tier");
    return null;
  }
  const subscriptionType = await db.stripePrice.findMany({
    where: {
      OR: [
        {
          id: priceIds[0],
        },
        {
          id: priceIds[1],
        },
        {
          id: priceIds[2],
        },
      ],
    },
  });

  if (subscriptionType.length !== 3) {
    console.error(
      "Could not find three Stripe price entries in DB from price IDs",
    );
    return null;
  }
  // if the subscription type isnt the same for all three price IDs, throw an error
  if (
    subscriptionType.some(
      (price) =>
        price.subscriptionType !== subscriptionType[0]!.subscriptionType,
    )
  ) {
    console.error("Subscription type is not the same for all three price IDs");
    return null;
  }

  return subscriptionType[0]!.subscriptionType;
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
