import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import Stripe from "stripe";
import { z } from "zod";

import { kv } from "@ebox/redis-client";

import { createTRPCRouter, protectedCustomerProcedure } from "../trpc";
import { subscriptionDataSchema } from "../utils/subscription-utils";

export const subscriptionRouter = createTRPCRouter({
  subscribe: protectedCustomerProcedure
    .input(
      z.object({
        lookupKey: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Validate lookup key
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

      const priceValidation = await stripe.prices.list({
        lookup_keys: [input.lookupKey],
        limit: 1,
      });

      if (priceValidation.data.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid lookup key provided",
        });
      }

      const url = await createStripeSession(input.lookupKey);
      return { url };
    }),
});

const createStripeSession = async (lookupKey: string) => {
  const user = await currentUser();

  if (!user) {
    throw new Error("User not found");
  }

  let stripeCustomerId = user.privateMetadata.stripeCustomerId as string;

  // Check if customer is already subscribed
  if (stripeCustomerId) {
    const subscriptionDataKv = await kv.get(
      `stripe:customer:${stripeCustomerId}`,
    );
    const parsedSubscriptionData =
      subscriptionDataSchema.safeParse(subscriptionDataKv);
    const subscriptionData = parsedSubscriptionData.data;
    if (subscriptionData?.status === "active") {
      console.error("Customer is already subscribed");
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Customer is already subscribed",
      });
    }
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  // Create a new Stripe customer if this user doesn't have one
  if (!stripeCustomerId) {
    const newCustomer = await stripe.customers.create({
      email: user.primaryEmailAddress?.emailAddress,
      metadata: {
        userId: user.id, // DO NOT FORGET THIS
      },
    });

    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(user.id, {
      privateMetadata: {
        stripeCustomerId: newCustomer.id,
      },
    });

    stripeCustomerId = newCustomer.id;
  }

  // Get all lookup keys for the selected tier (main tier + metering subscriptions)
  const lookupKeys = [
    lookupKey,
    lookupKey + "_allowance",
    lookupKey + "_overdue_holding",
  ];

  const prices = await stripe.prices.list({
    lookup_keys: lookupKeys,
    expand: ["data.product"],
  });

  // Create line items for all prices associated with this tier
  const lineItems = lookupKeys.map((key) => {
    const price = prices.data.find((price) => price.lookup_key === key);
    if (!price) {
      throw new Error(`Price not found for lookup key: ${key}`);
    }

    // For metered subscriptions, don't include quantity
    if (price.recurring?.usage_type === "metered") {
      return { price: price.id };
    }

    // For regular subscriptions, include quantity
    return { price: price.id, quantity: 1 };
  });

  // NOTE: localhost causes Stripe to fail
  const baseUrl =
    process.env.NEXT_PUBLIC_VERCEL_URL === "localhost:3000"
      ? "https://google.com"
      : process.env.NEXT_PUBLIC_VERCEL_URL;

  const session = await stripe.checkout.sessions.create({
    billing_address_collection: "auto",
    customer: stripeCustomerId,
    line_items: lineItems,
    mode: "subscription",
    success_url: `${baseUrl}/success`,
    cancel_url: `${baseUrl}/payment`,
  });

  if (!session.url) {
    throw new Error("session url not found");
  }

  return session.url;
};
