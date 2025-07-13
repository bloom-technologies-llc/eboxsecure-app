"use server";

import { hasValidSubscription } from "@ebox/client-api";

/**
 * Check if user has a valid subscription (status: "active")
 * Valid even if cancelAtPeriodEnd=true, as long as still in billing period
 */
export async function checkValidSubscription(): Promise<boolean> {
  return await hasValidSubscription();
}
