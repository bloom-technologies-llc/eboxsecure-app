import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/redis";
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";

import { db } from "@ebox/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

// Type for subscription data from KV store
interface SubscriptionData {
  priceIds?: string[];
  status?: string;
  currentPeriodEnd?: number;
  currentPeriodStart?: number;
  cancelAtPeriodEnd?: boolean;
  subscriptionId?: string;
}

type SubscriptionTier = "BASIC" | "BASIC_PLUS" | "PREMIUM" | "BUSINESS_PRO";

function mapPriceIdsToPlan(priceIds: string[]): SubscriptionTier | null {
  // Map price IDs to subscription tiers - using actual Stripe price IDs
  const priceToTierMap: Record<string, SubscriptionTier> = {
    price_1RkSngPFcJwvZfVCHyrtvBd9: "BASIC",
    price_1RkSnuPFcJwvZfVCJ3qI6lgM: "BASIC_PLUS",
    price_1RkSo7PFcJwvZfVCzrflTcSJ: "PREMIUM",
    price_1RkSoHPFcJwvZfVCZbw7oV6y: "BUSINESS_PRO",
  };

  for (const priceId of priceIds) {
    if (priceToTierMap[priceId]) {
      return priceToTierMap[priceId];
    }
  }

  return null;
}

// Get holding allowance for each subscription tier
function getHoldingAllowance(tier: SubscriptionTier): number {
  const allowances = {
    BASIC: 2, // 2-day holding allowance
    BASIC_PLUS: 5, // 5-day holding allowance
    PREMIUM: 7, // 7-day holding allowance
    BUSINESS_PRO: 10, // 10-day holding allowance
  };

  return allowances[tier];
}

// Get customer's subscription tier and holding allowance
async function getCustomerHoldingAllowance(stripeCustomerId: string): Promise<{
  tier: SubscriptionTier | null;
  allowance: number;
}> {
  try {
    const subscriptionData = await kv.get<SubscriptionData>(
      `stripe:customer:${stripeCustomerId}`,
    );

    if (!subscriptionData || !subscriptionData.priceIds) {
      return { tier: null, allowance: 0 };
    }

    const tier = mapPriceIdsToPlan(subscriptionData.priceIds);

    if (!tier) {
      return { tier: null, allowance: 0 };
    }

    const allowance = getHoldingAllowance(tier);

    return { tier, allowance };
  } catch (error) {
    console.error("Error getting customer holding allowance:", error);
    return { tier: null, allowance: 0 };
  }
}

// Calculate days between two dates
function calculateDaysBetween(startDate: Date, endDate: Date): number {
  const timeDiff = endDate.getTime() - startDate.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

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
    const { deliveredDate, pickedUpAt, processedAt, stripeCustomerId } = body;

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

    // Calculate overage holding days if package was picked up
    let meterEventResult = null;
    let calculationInfo = null;

    if (pickedUpAt && deliveredDate && stripeCustomerId) {
      try {
        const deliveredDateTime = new Date(deliveredDate);
        const pickedUpDateTime = new Date(pickedUpAt);

        // Calculate total holding days
        const holdingDays = calculateDaysBetween(
          deliveredDateTime,
          pickedUpDateTime,
        );

        // Get customer's subscription allowance
        const { tier, allowance } =
          await getCustomerHoldingAllowance(stripeCustomerId);

        // Calculate overage days
        const overageDays = Math.max(0, holdingDays - allowance);

        calculationInfo = {
          holdingDays,
          tier,
          allowance,
          overageDays,
          deliveredDate: deliveredDateTime,
          pickedUpAt: pickedUpDateTime,
        };

        console.log("Holding calculation:", calculationInfo);

        // Only create meter event if there are overage days
        if (overageDays > 0) {
          const meterEvent = await stripe.billing.meterEvents.create({
            event_name: "overdue_package_holding",
            payload: {
              stripe_customer_id: stripeCustomerId,
              value: overageDays.toString(),
            },
          });

          console.log("Meter event created:", meterEvent);

          // Create MeterEvent record in database
          const dbMeterEvent = await db.meterEvent.create({
            data: {
              eventType: "OVERDUE_PACKAGE_HOLDING",
              value: overageDays,
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
        } else {
          console.log("No overage days - no meter event created");
        }
      } catch (meterError) {
        console.error(
          "Failed to calculate overage or create meter event:",
          meterError,
        );
        // Don't fail the order creation if meter event fails
      }
    }

    return NextResponse.json({
      success: true,
      order: order,
      meterEvent: meterEventResult,
      calculation: calculationInfo,
    });
  } catch (error) {
    console.error("Error creating order:", error);

    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }
}
