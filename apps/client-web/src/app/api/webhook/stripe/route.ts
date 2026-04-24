import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { env } from "@/env";
import Stripe from "stripe";

import { db } from "@ebox/db";
import { NotificationService } from "@ebox/notifications";
import { syncCustomerData } from "@ebox/stripe";

export async function POST(req: Request) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature");

    if (!signature) return NextResponse.json({}, { status: 400 });

    async function doEventProcessing() {
      if (typeof signature !== "string") {
        throw new Error("[STRIPE HOOK] Header is not a string");
      }

      const evt = stripe.webhooks.constructEvent(
        body,
        signature,
        env.STRIPE_WEBHOOK_SECRET,
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

const notificationEvents = [
  "invoice.payment_failed",
  "invoice.paid",
  "customer.subscription.trial_will_end",
] as const;

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

  // Sync customer data first
  await syncCustomerData(customerId);

  // Send notifications for specific events
  if (
    (notificationEvents as readonly string[]).includes(event.type)
  ) {
    try {
      // Look up user by stripe customer ID
      const customer = await db.customerAccount.findFirst({
        where: { stripeCustomerId: customerId },
        select: { id: true },
      });

      if (customer) {
        const notificationService = new NotificationService(db);

        switch (event.type) {
          case "invoice.payment_failed":
            await notificationService.send({
              userId: customer.id,
              type: "PAYMENT_FAILED",
              message:
                "A payment for your subscription has failed. Please update your payment method.",
            });
            break;

          case "invoice.paid":
            await notificationService.send({
              userId: customer.id,
              type: "INVOICE_PAID",
              message: "Your invoice payment has been received. Thank you!",
            });
            break;

          case "customer.subscription.trial_will_end":
            await notificationService.send({
              userId: customer.id,
              type: "TRIAL_ENDING_SOON",
              message:
                "Your trial is ending soon. Make sure your payment method is up to date.",
            });
            break;
        }
      }
    } catch (error) {
      console.error(
        `[STRIPE HOOK] Failed to send notification for ${event.type}:`,
        error,
      );
    }
  }
}
