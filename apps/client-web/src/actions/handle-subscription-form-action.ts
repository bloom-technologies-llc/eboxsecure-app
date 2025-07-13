"use server";

import { redirect } from "next/navigation";
import { SubscriptionTier } from "@/types/subscription";

import { handleSubscription } from "./handle-subscription";

function isValidSubscriptionTier(value: string): value is SubscriptionTier {
  return Object.values(SubscriptionTier).includes(value as SubscriptionTier);
}

export async function handleSubscriptionFormAction(formData: FormData) {
  const lookupKey = formData.get("lookupKey") as string;
  if (!lookupKey) {
    throw new Error("No lookup key provided");
  }

  if (!isValidSubscriptionTier(lookupKey)) {
    throw new Error("Invalid subscription tier provided");
  }

  const url = await handleSubscription(lookupKey);
  if (url) {
    redirect(url);
  }
}
