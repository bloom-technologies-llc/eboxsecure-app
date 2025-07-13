import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";

import { kv } from "@ebox/redis-client";

import { createTRPCRouter, protectedCustomerProcedure } from "../trpc";

// Type for subscription data from KV store
interface SubscriptionData {
  priceIds?: string[];
  status?: string;
  currentPeriodEnd?: number;
  currentPeriodStart?: number;
  cancelAtPeriodEnd?: boolean;
  subscriptionId?: string;
}

// Mapping of actual Stripe price IDs to subscription tiers
const priceIdToPlanMap: Record<string, string> = {
  price_1RjSVSPFcJwvZfVCZKFrGzCs: "BASIC",
  price_1RjSfGPFcJwvZfVCJIFwPPWK: "BASIC_PLUS",
  price_1Reh3nPFcJwvZfVCaw9leF9A: "PREMIUM",
  price_1Reh51PFcJwvZfVCUGj9UBbv: "BUSINESS_PRO",
};

function mapPriceIdsToPlan(priceIds: string[]): string | null {
  for (const priceId of priceIds) {
    if (priceIdToPlanMap[priceId]) {
      return priceIdToPlanMap[priceId];
    }
  }
  return null; // No matching price ID found
}

export const meterRouter = createTRPCRouter({
  // Get current metered usage for the customer
  getCurrentUsage: protectedCustomerProcedure.query(async ({ ctx }) => {
    const user = await currentUser();

    if (!user) {
      throw new Error("User not found");
    }

    let stripeCustomerId = user.privateMetadata.stripeCustomerId as string;

    // Get the customer's subscription data from KV store
    const subscriptionData = await kv.get<SubscriptionData>(
      `stripe:customer:${stripeCustomerId}`,
    );

    if (!subscriptionData || !subscriptionData.priceIds) {
      throw new Error("No subscription data found for customer");
    }

    const subscriptionTier = mapPriceIdsToPlan(subscriptionData.priceIds);

    if (!subscriptionTier) {
      throw new Error("Unable to determine subscription tier from price IDs");
    }

    // Get current month's meter events
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    // Fetch meter events for current month
    const meterEvents = await ctx.db.meterEvent.findMany({
      where: {
        customerId: user.id,
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate usage by event type
    const holdingUsage = meterEvents
      .filter((event) => event.eventType === "PACKAGE_HOLDING")
      .reduce((sum, event) => sum + event.value, 0);

    const allowanceUsage = meterEvents
      .filter((event) => event.eventType === "PACKAGE_ALLOWANCE")
      .reduce((sum, event) => sum + event.value, 0);

    // Define subscription limits based on tier
    const subscriptionLimits = {
      BASIC: {
        packageHolding: 2, // 2-day holding
        packageAllowance: 5, // 5 packages max
      },
      BASIC_PLUS: {
        packageHolding: 5, // 5-day holding
        packageAllowance: 20, // 20 packages max
      },
      PREMIUM: {
        packageHolding: 7, // 7-day holding
        packageAllowance: 50, // 50 packages max
      },
      BUSINESS_PRO: {
        packageHolding: 10, // 10-day holding
        packageAllowance: 200, // 200 packages max
      },
    };

    const currentLimits =
      subscriptionLimits[subscriptionTier as keyof typeof subscriptionLimits];

    return {
      subscription: subscriptionTier,
      usage: {
        holding: holdingUsage,
        allowance: allowanceUsage,
      },
      limits: currentLimits,
      period: {
        start: startOfMonth,
        end: endOfMonth,
      },
      events: meterEvents,
    };
  }),

  // Get detailed usage history
  getUsageHistory: protectedCustomerProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        eventType: z.enum(["PACKAGE_HOLDING", "PACKAGE_ALLOWANCE"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const customerId = ctx.session.userId;

      const startDate =
        input.startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
      const endDate = input.endDate || new Date();

      const whereClause: any = {
        customerId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      };

      if (input.eventType) {
        whereClause.eventType = input.eventType;
      }

      const events = await ctx.db.meterEvent.findMany({
        where: whereClause,
        include: {
          order: {
            select: {
              id: true,
              vendorOrderId: true,
              shippedLocation: {
                select: {
                  name: true,
                  address: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return events;
    }),
});
