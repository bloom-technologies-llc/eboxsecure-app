"use server";

import {
  Plan,
  SubscriptionData,
  SubscriptionStatus,
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
  const plan = planString ? stringToPlan(planString) : undefined;

  return {
    status: subscriptionData.status,
    plan,
    currentPeriodEnd: subscriptionData.currentPeriodEnd,
    cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd,
    subscriptionId: subscriptionData.subscriptionId,
  };
}

// Convert string plan name to Plan enum
function stringToPlan(planString: string): Plan | undefined {
  const mapping: Record<string, Plan> = {
    BASIC: Plan.BASIC,
    BASIC_PLUS: Plan.BASIC_PLUS,
    PREMIUM: Plan.PREMIUM,
    BUSINESS_PRO: Plan.BUSINESS_PRO,
  };
  return mapping[planString];
}
