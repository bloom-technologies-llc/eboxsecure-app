"use server";

import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

import { createStripeSession } from "./create-stripe-session";
import {
  getCurrentSubscriptionStatus,
  SubscriptionTier,
} from "./get-subscription-data";

export async function upgradeSubscription(lookupKey: string) {
  const user = await currentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  const currentStatus = await getCurrentSubscriptionStatus();

  // Validate upgrade path
  if (currentStatus.status !== "active" && currentStatus.status !== "none") {
    throw new Error("Cannot upgrade subscription in current state");
  }

  return await createStripeSession(lookupKey as any);
}

export async function handleUpgradeFormAction(formData: FormData) {
  const lookupKey = formData.get("lookupKey") as string;
  if (!lookupKey) {
    throw new Error("No lookup key provided");
  }

  const url = await upgradeSubscription(lookupKey);
  if (url) {
    redirect(url);
  }
}
