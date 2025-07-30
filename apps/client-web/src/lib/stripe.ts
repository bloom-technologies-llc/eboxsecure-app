import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";

import { kv } from "@ebox/redis-client";

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
});

/**
 * Check if user has a valid subscription (status: "active")
 * Valid even if cancelAtPeriodEnd=true, as long as still in billing period
 */
export async function hasValidSubscription() {
  const user = await currentUser();

  if (!user) {
    console.error("Request does not have user");
    return false;
  }

  const stripeCustomerId = user.privateMetadata.stripeCustomerId as string;
  if (!stripeCustomerId) {
    return false;
  }

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
