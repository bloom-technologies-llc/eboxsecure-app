"use server";

import { redirect } from "next/navigation";
import { Plan } from "@/types/subscription";

import { handleSubscription } from "./handle-subscription";

function isValidPlan(value: string): value is Plan {
  return Object.values(Plan).includes(value as Plan);
}

export async function handleSubscriptionFormAction(formData: FormData) {
  const lookupKey = formData.get("lookupKey") as string;
  if (!lookupKey) {
    throw new Error("No lookup key provided");
  }

  if (!isValidPlan(lookupKey)) {
    throw new Error("Invalid subscription tier provided");
  }

  const url = await handleSubscription(lookupKey);
  if (url) {
    redirect(url);
  }
}
