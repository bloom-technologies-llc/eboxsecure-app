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

  const subData: SubscriptionData = {
    subscriptionId: subscription.id,
    status: subscription.status,
    priceIds: subscription.items.data.map((item) => item.price.id),
    currentPeriodEnd: subscription.items.data[0]?.current_period_end!,
    currentPeriodStart: subscription.items.data[0]?.current_period_start!,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };

  if (subscription.schedule && typeof subscription.schedule === "string") {
    const schedule = await stripe.subscriptionSchedules.retrieve(
      subscription.schedule,
    );

    const currentTime = Math.floor(Date.now() / 1000);
    // Get the next phase that hasn't started yet
    const upcomingPhase = schedule.phases.find(
      (phase) => phase.start_date > currentTime,
    );

    if (upcomingPhase) {
      console.log("Found upcoming scheduled phase:", {
        scheduleId: schedule.id,
        startDate: upcomingPhase.start_date,
        itemCount: upcomingPhase.items.length,
      });

      subData.schedule = {
        scheduleId: schedule.id,
        startDate: upcomingPhase.start_date,
        endDate: upcomingPhase.end_date ?? 0, // Default to 0 if no end date
        items: upcomingPhase.items.map((item) => ({
          price: typeof item.price === "string" ? item.price : item.price.id,
        })),
      };
    } else {
      console.log(
        "No upcoming scheduled phase found for schedule:",
        schedule.id,
      );
    }
  }

  await kv.set(`stripe:customer:${customerId}`, subData);
  return subData;
}
