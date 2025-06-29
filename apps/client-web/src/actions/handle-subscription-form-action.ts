"use server";

import { redirect } from "next/navigation";

import { handleSubscription } from "./handle-subscription";

export async function handleSubscriptionFormAction(formData: FormData) {
  const lookupKey = formData.get("lookupKey") as string;
  if (!lookupKey) {
    throw new Error("No lookup key provided");
  }

  const url = await handleSubscription(lookupKey);
  if (url) {
    redirect(url);
  }
}
