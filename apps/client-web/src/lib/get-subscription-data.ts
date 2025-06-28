"use server";

import {
  SubscriptionData,
  SubscriptionStatus,
  SubscriptionTier,
} from "@/types/subscription";
import { currentUser } from "@clerk/nextjs/server";

import { kv } from "./redis";

export async function getCurrentSubscriptionStatus(): Promise<SubscriptionStatus> {
  const user = await currentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  if (!user?.privateMetadata?.stripeCustomerId) {
    return { status: "none" };
  }

  const customerId = user.privateMetadata.stripeCustomerId as string;
  const subscriptionData = await kv.get<SubscriptionData>(
    `stripe:customer:${customerId}`,
  );

  if (!subscriptionData || subscriptionData.status === "none") {
    return { status: "none" };
  }

  // Map price IDs to plan names
  const plan = mapPriceIdsToPlan(subscriptionData.priceIds);

  return {
    status: subscriptionData.status,
    plan,
    currentPeriodEnd: subscriptionData.currentPeriodEnd,
    cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd,
    subscriptionId: subscriptionData.subscriptionId,
  };
}

function mapPriceIdsToPlan(priceIds: string[]): SubscriptionTier | undefined {
  // Mapping of actual Stripe price IDs to subscription tiers
  const priceIdToPlanMap: Record<string, SubscriptionTier> = {
    price_1Re6nPPFcJwvZfVCIGbcwpCU: SubscriptionTier.BASIC,
    price_1Re6nPPFcJwvZfVC8pyDTQ6D: SubscriptionTier.BASIC_PRO,
    price_1Reh3nPFcJwvZfVCaw9leF9A: SubscriptionTier.PREMIUM,
    price_1Reh51PFcJwvZfVCUGj9UBbv: SubscriptionTier.BUSINESS_PRO,
  };

  for (const priceId of priceIds) {
    if (priceIdToPlanMap[priceId]) {
      return priceIdToPlanMap[priceId];
    }
  }

  return undefined;
}
