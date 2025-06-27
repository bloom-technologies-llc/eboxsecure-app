"use server";

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";

export async function createStripeSession(
  lookupKey: "basic" | "basic_pro" | "premium" | "business_pro",
) {
  const user = await currentUser();

  if (!user) {
    throw new Error("User not found");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  let stripeCustomerId = user.privateMetadata.stripeCustomerId as string;

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
  }

  const lookupKeys = [lookupKey];

  const prices = await stripe.prices.list({
    lookup_keys: lookupKeys,
    expand: ["data.product"],
  });

  const price = prices.data.find((price) => price.lookup_key === lookupKey);

  const session = await stripe.checkout.sessions.create({
    billing_address_collection: "auto",
    customer: stripeCustomerId,
    line_items: [{ price: price!.id, quantity: 1 }],
    mode: "subscription",
    success_url: "https://bca9-24-47-182-131.ngrok-free.app/success",
  });

  if (!session.url) {
    throw new Error("session url not found");
  }

  return session.url;
}
