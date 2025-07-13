import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { syncCustomerData } from "@/lib/sync-customer-data";
import Stripe from "stripe";

const allowedEvents: Stripe.Event.Type[] = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.paused",
  "customer.subscription.resumed",
  "customer.subscription.pending_update_applied",
  "customer.subscription.pending_update_expired",
  "customer.subscription.trial_will_end",
  "invoice.paid",
  "invoice.payment_failed",
  "invoice.payment_action_required",
  "invoice.upcoming",
  "invoice.marked_uncollectible",
  "invoice.payment_succeeded",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "payment_intent.canceled",
  // Customer portal events
  "customer.updated",
  "payment_method.attached",
  "payment_method.detached",
  "customer.tax_id.created",
  "customer.tax_id.updated",
  "customer.tax_id.deleted",
  "billing_portal.session.created",
];

export async function POST(req: Request) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature");

    if (!signature) return NextResponse.json({}, { status: 400 });

    async function doEventProcessing() {
      if (typeof signature !== "string") {
        throw new Error("Header is not a string");
      }

      const evt = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBOOK_SECRET!,
      );

      await processEvent(evt);
    }
    try {
      await doEventProcessing();
    } catch (error) {
      console.error("error processing event", error);
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[STRIPE HOOK] Error processing event", error);
    return NextResponse.json({ received: false }, { status: 500 });
  }
}

async function processEvent(event: Stripe.Event) {
  if (!allowedEvents.includes(event.type)) return;

  const { customer: customerId } = event?.data?.object as {
    customer: string;
  };

  if (typeof customerId !== "string") {
    throw new Error(
      `[STRIPE HOOK][CANCER] ID isn't string. \nEvent type: ${event.type}`,
    );
  }
  return await syncCustomerData(customerId);
}
