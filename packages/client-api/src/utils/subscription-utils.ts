import { currentUser } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";

import { kv } from "@ebox/redis-client";

// Type for subscription data from KV store
interface SubscriptionData {
  priceIds?: string[];
  status?: string;
  currentPeriodEnd?: number;
  currentPeriodStart?: number;
  cancelAtPeriodEnd?: boolean;
  subscriptionId?: string;
}

// Exported mapping of Stripe price IDs to subscription tiers
export const priceIdToPlanMap: Record<string, string> = {
  price_1RkSngPFcJwvZfVCHyrtvBd9: "BASIC",
  price_1RkSnuPFcJwvZfVCJ3qI6lgM: "BASIC_PLUS",
  price_1RkSo7PFcJwvZfVCzrflTcSJ: "PREMIUM",
  price_1RkSoHPFcJwvZfVCZbw7oV6y: "BUSINESS_PRO",
};

// Subscription plan enum - matches client-web types
export enum Plan {
  BASIC = "basic",
  BASIC_PLUS = "basic_plus",
  PREMIUM = "premium",
  BUSINESS_PRO = "business_pro",
}

// Mapping of plans to all their associated subscription lookup keys (main + metering)
export const TIER_SUBSCRIPTIONS: Record<Plan, string[]> = {
  [Plan.BASIC]: ["basic", "basic_holding", "basic_allowance"],
  [Plan.BASIC_PLUS]: [
    "basic_plus",
    "basic_plus_holding",
    "basic_plus_allowance",
  ],
  [Plan.PREMIUM]: ["premium", "premium_holding", "premium_allowance"],
  [Plan.BUSINESS_PRO]: [
    "business_pro",
    "business_pro_holding",
    "business_pro_allowance",
  ],
};

// Location limits per subscription tier
const LOCATION_LIMITS = {
  BASIC: 3,
  BASIC_PLUS: 25,
  PREMIUM: 75,
  BUSINESS_PRO: -1, // -1 means unlimited
};

export function mapPriceIdsToPlan(priceIds: string[]): string | null {
  for (const priceId of priceIds) {
    if (priceIdToPlanMap[priceId]) {
      return priceIdToPlanMap[priceId];
    }
  }
  return null;
}

/**
 * Check if user has a valid subscription (status: "active")
 * Valid even if cancelAtPeriodEnd=true, as long as still in billing period
 */
export async function hasValidSubscription(): Promise<boolean> {
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
      message: "No Stripe customer ID found for user",
    });
  }

  const subscriptionData = await kv.get<SubscriptionData>(
    `stripe:customer:${stripeCustomerId}`,
  );

  return subscriptionData?.status === "active";
}

/**
 * Get the location limit for a subscription tier
 */
export function getLocationLimit(subscriptionTier: string): number {
  return LOCATION_LIMITS[subscriptionTier as keyof typeof LOCATION_LIMITS] || 0;
}

/**
 * Get user's current subscription tier from KV store
 */
export async function getUserSubscriptionTier(): Promise<string> {
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
      message: "No Stripe customer ID found for user",
    });
  }

  // Get the customer's subscription data from KV store
  const subscriptionData = await kv.get<SubscriptionData>(
    `stripe:customer:${stripeCustomerId}`,
  );

  if (!subscriptionData || !subscriptionData.priceIds) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "No subscription data found for user",
    });
  }

  const subscriptionTier = mapPriceIdsToPlan(subscriptionData.priceIds);

  if (!subscriptionTier) {
    // Unable to determine tier, default to BASIC
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "No subscription data found for user",
    });
  }

  return subscriptionTier;
}

/**
 * Check if user can add more favorite locations
 */
export async function canUserAddMoreFavorites(
  currentFavoriteCount: number,
  subscriptionTier?: string,
): Promise<{ canAdd: boolean; limit: number; remaining: number }> {
  const tier = subscriptionTier || (await getUserSubscriptionTier());
  const limit = getLocationLimit(tier);

  // If unlimited (-1), user can always add more
  if (limit === -1) {
    return {
      canAdd: true,
      limit: -1,
      remaining: -1,
    };
  }

  const remaining = Math.max(0, limit - currentFavoriteCount);

  return {
    canAdd: remaining > 0,
    limit,
    remaining,
  };
}

/**
 * Get subscription limits information for a user
 */
export async function getSubscriptionLimits() {
  const subscriptionTier = await getUserSubscriptionTier();
  const locationLimit = getLocationLimit(subscriptionTier);

  return {
    subscriptionTier,
    locationLimit,
    isUnlimited: locationLimit === -1,
  };
}
