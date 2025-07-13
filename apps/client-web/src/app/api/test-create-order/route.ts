import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/redis";
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";

import { db } from "@ebox/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const {
      deliveredDate,
      pickedUpAt,
      processedAt,
      meterEventName,
      meterEventValue,
      stripeCustomerId,
    } = body;

    // Create the order
    const order = await db.order.create({
      data: {
        customerId: userId,
        vendorOrderId: "VENDOR_1751645702071_0",
        total: 20,
        shippedLocationId: 2,
        deliveredDate: deliveredDate ? new Date(deliveredDate) : null,
        pickedUpAt: pickedUpAt ? new Date(pickedUpAt) : null,
        processedAt: processedAt ? new Date(processedAt) : null,
        carrierId: null,
        meteredAt: null,
        meterEventId: null,
      },
    });

    console.log("Order created:", order);

    // Send meter event if provided
    let meterEventResult = null;
    if (meterEventName && meterEventValue && stripeCustomerId) {
      try {
        const meterEvent = await stripe.billing.meterEvents.create({
          event_name: meterEventName,
          payload: {
            stripe_customer_id: stripeCustomerId,
            value: meterEventValue.toString(),
          },
        });

        console.log("Meter event created:", meterEvent);

        // Create MeterEvent record in database
        const dbMeterEvent = await db.meterEvent.create({
          data: {
            eventType:
              meterEventName === "package_holding"
                ? "PACKAGE_HOLDING"
                : "PACKAGE_ALLOWANCE",
            value: meterEventValue,
            customerId: userId,
            stripeEventId: `event_${Date.now()}`,
            orderId: order.id,
          },
        });

        console.log("Database meter event created:", dbMeterEvent);

        // Update order with meter event info
        await db.order.update({
          where: { id: order.id },
          data: {
            meteredAt: new Date(),
            meterEventId: dbMeterEvent.id,
          },
        });

        meterEventResult = { stripe: meterEvent, database: dbMeterEvent };
      } catch (meterError) {
        console.error("Failed to create meter event:", meterError);
        // Don't fail the order creation if meter event fails
      }
    }

    return NextResponse.json({
      success: true,
      order: order,
      meterEvent: meterEventResult,
    });
  } catch (error) {
    console.error("Error creating order:", error);

    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }
}
