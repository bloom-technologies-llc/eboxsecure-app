import "server-only";

import { env } from "@/env";
import { SubscriptionData } from "@/types/subscription";
import Stripe from "stripe";

import { kv } from "@ebox/redis-client";

export async function syncCustomerData(customerId: string) {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

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

  // TODO: remove this
  console.log({ subscriptionData: JSON.stringify(subscription, null, 2) });

  const subData: SubscriptionData = {
    subscriptionId: subscription.id,
    status: subscription.status,
    priceIds: subscription.items.data.map((item) => item.price.id),
    currentPeriodEnd: subscription.items.data[0]?.current_period_end!,
    currentPeriodStart: subscription.items.data[0]?.current_period_start!,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };
  await kv.set(`stripe:customer:${customerId}`, subData);
  return subData;
}
