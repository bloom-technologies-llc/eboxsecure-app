"use server";

import {
  SubscriptionData,
  SubscriptionStatus,
  SubscriptionTier,
} from "@/types/subscription";
import { currentUser } from "@clerk/nextjs/server";

import { mapPriceIdsToPlan } from "@ebox/client-api";

import { kv } from "./redis";

export async function getCurrentSubscriptionStatus(): Promise<SubscriptionStatus> {
  const user = await currentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  if (!user?.privateMetadata?.stripeCustomerId) {
    return { status: "none" };
  }

  //TODO: use package
  const customerId = user.privateMetadata.stripeCustomerId as string;
  const subscriptionData = await kv.get<SubscriptionData>(
    `stripe:customer:${customerId}`,
  );

  if (!subscriptionData || subscriptionData.status === "none") {
    return { status: "none" };
  }

  // Map price IDs to plan names
  const planString = mapPriceIdsToPlan(subscriptionData.priceIds);
  const plan = planString ? stringToSubscriptionTier(planString) : undefined;

  return {
    status: subscriptionData.status,
    plan,
    currentPeriodEnd: subscriptionData.currentPeriodEnd,
    cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd,
    subscriptionId: subscriptionData.subscriptionId,
  };
}

// Convert string plan name to SubscriptionTier enum
function stringToSubscriptionTier(
  planString: string,
): SubscriptionTier | undefined {
  const mapping: Record<string, SubscriptionTier> = {
    BASIC: SubscriptionTier.BASIC,
    BASIC_PLUS: SubscriptionTier.BASIC_PLUS,
    PREMIUM: SubscriptionTier.PREMIUM,
    BUSINESS_PRO: SubscriptionTier.BUSINESS_PRO,
  };
  return mapping[planString];
}
