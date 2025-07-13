import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/redis";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventName, customerId, value } = body;

    // Validate required fields
    if (!eventName || !customerId || !value) {
      return NextResponse.json(
        { error: "Missing required fields: eventName, customerId, value" },
        { status: 400 },
      );
    }

    // Create meter event
    const meterEvent = await stripe.billing.meterEvents.create({
      event_name: eventName,
      payload: {
        stripe_customer_id: customerId,
        value: value.toString(),
      },
    });

    console.log("Meter event created:", meterEvent);

    // Store meter event data in KV store
    const kvKey = `meter_event:${customerId}`;
    const kvData = {
      meterEvent: meterEvent,
      timestamp: new Date().toISOString(),
      customerId,
      eventName,
      value,
    };

    try {
      await kv.set(kvKey, kvData);
      console.log("Meter event stored in KV:", kvKey);
    } catch (kvError) {
      console.error("Failed to store meter event in KV:", kvError);
      // Don't fail the request if KV storage fails
    }

    return NextResponse.json({
      success: true,
      meterEvent: meterEvent,
    });
  } catch (error) {
    console.error("Error creating meter event:", error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create meter event" },
      { status: 500 },
    );
  }
}
