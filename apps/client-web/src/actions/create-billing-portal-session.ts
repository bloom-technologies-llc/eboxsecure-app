"use server";

import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";

export async function createBillingPortalSession() {
  const user = await currentUser();

  if (!user) {
    throw new Error("User not found");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const stripeCustomerId = user.privateMetadata.stripeCustomerId as string;

  if (!stripeCustomerId) {
    redirect("/payment");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_URL || `${process.env.NEXT_NGROK_URL}`}/settings/subscription`,
  });

  if (!session.url) {
    throw new Error("Failed to create billing portal session");
  }

  redirect(session.url);
}
