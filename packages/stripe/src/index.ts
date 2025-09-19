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
  schedule?: {
    scheduleId: string;
    startDate: number;
    endDate: number;
    items: {
      price: string;
    }[];
  };
};

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
  schedule: z.optional(
    z.object({
      scheduleId: z.string(),
      startDate: z.number(),
      endDate: z.number(),
      items: z.array(
        z.object({
          price: z.string(),
        }),
      ),
    }),
  ),
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
async function getUserSubscriptionTier(stripeCustomerId: string) {
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

  const subscriptionTier = await priceIdsToPlan(subscriptionData.priceIds);

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
export async function canUserAddMoreFavorites(
  currentFavoriteCount: number,
  stripeCustomerId: string,
) {
  const tier = await getUserSubscriptionTier(stripeCustomerId);

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

// TODO: replace with DB query
export function getLocationLimit(subscriptionTier: SubscriptionType): number {
  return LOCATION_LIMITS[subscriptionTier as keyof typeof LOCATION_LIMITS] || 0;
}

/**
 * Check if there's a scheduled plan change
 */
export function hasScheduledChange(
  subscriptionData: SubscriptionData,
): boolean {
  return !!subscriptionData.schedule;
}

/**
 * Get the scheduled plan information
 */
export async function getScheduledPlanInfo(subscriptionData: SubscriptionData) {
  if (!subscriptionData.schedule) {
    return null;
  }

  const scheduledPriceIds = subscriptionData.schedule.items.map(
    (item) => item.price,
  );
  const scheduledPlan = await priceIdsToPlan(scheduledPriceIds);

  return {
    plan: scheduledPlan,
    startDate: subscriptionData.schedule.startDate,
    endDate: subscriptionData.schedule.endDate,
    priceIds: scheduledPriceIds,
  };
}

/**
 * Determine if the scheduled change is an upgrade or downgrade
 */
export function getScheduledChangeType(
  currentPlan: SubscriptionType,
  scheduledPlan: SubscriptionType,
): "upgrade" | "downgrade" | "none" {
  const planHierarchy = {
    [SubscriptionType.BASIC]: 1,
    [SubscriptionType.BASIC_PLUS]: 2,
    [SubscriptionType.PREMIUM]: 3,
    [SubscriptionType.BUSINESS_PRO]: 4,
  };

  const currentLevel = planHierarchy[currentPlan];
  const scheduledLevel = planHierarchy[scheduledPlan];

  if (scheduledLevel > currentLevel) return "upgrade";
  if (scheduledLevel < currentLevel) return "downgrade";
  return "none";
}

/**
 * Check if user has a valid subscription (status: "active")
 * Valid even if cancelAtPeriodEnd=true, as long as still in billing period
 */
export async function hasValidSubscription(stripeCustomerId: string) {
  const subscriptionDataKv = await kv.get(
    `stripe:customer:${stripeCustomerId}`,
  );

  const parsedSubData = subscriptionDataSchema.safeParse(subscriptionDataKv);

  if (!parsedSubData.success) {
    return false;
  }

  const subscriptionData = parsedSubData.data;

  return subscriptionData.status === "active";
}

// Used in webhook
export async function syncCustomerData(customerId: string) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    limit: 1,
    status: "all",
    expand: ["data.default_payment_method"],
  });

  if (subscriptions.data.length === 0) {
    const subData = { status: "none" };
    await kv.set(`stripe:customer:${customerId}`, subData);
    return subData;
  }

  const subscription = subscriptions.data[0];

  if (!subscription) {
    throw new Error(`No subscriptions found`);
  }

  const subData: SubscriptionData = {
    subscriptionId: subscription.id,
    status: subscription.status,
    priceIds: subscription.items.data.map((item) => item.price.id),
    currentPeriodEnd: subscription.items.data[0]?.current_period_end!,
    currentPeriodStart: subscription.items.data[0]?.current_period_start!,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };

  if (subscription.schedule && typeof subscription.schedule === "string") {
    const schedule = await stripe.subscriptionSchedules.retrieve(
      subscription.schedule,
    );

    const currentTime = Math.floor(Date.now() / 1000);
    // Get the next phase that hasn't started yet
    const upcomingPhase = schedule.phases.find(
      (phase) => phase.start_date > currentTime,
    );

    if (upcomingPhase) {
      console.log("Found upcoming scheduled phase:", {
        scheduleId: schedule.id,
        startDate: upcomingPhase.start_date,
        itemCount: upcomingPhase.items.length,
      });

      subData.schedule = {
        scheduleId: schedule.id,
        startDate: upcomingPhase.start_date,
        endDate: upcomingPhase.end_date ?? 0, // Default to 0 if no end date
        items: upcomingPhase.items.map((item) => ({
          price: typeof item.price === "string" ? item.price : item.price.id,
        })),
      };
    } else {
      console.log(
        "No upcoming scheduled phase found for schedule:",
        schedule.id,
      );
    }
  }

  await kv.set(`stripe:customer:${customerId}`, subData);
  return subData;
}

export async function getStripeCustomerId(userId: string) {
  const user = await db.customerAccount.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });
  return user.stripeCustomerId;
}
