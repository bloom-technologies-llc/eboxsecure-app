import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { kv } from "@ebox/redis-client";
import {
  getStripeCustomerId,
  priceIdsToPlan,
  subscriptionDataSchema,
} from "@ebox/stripe";

import { createTRPCRouter, protectedCustomerProcedure } from "../trpc";

export const meterRouter = createTRPCRouter({
  getCurrentUsage: protectedCustomerProcedure.query(async ({ ctx }) => {
    const stripeCustomerId = await getStripeCustomerId(ctx.session.userId);

    // Get the customer's subscription data from KV store
    const subscriptionDataKv = await kv.get(
      `stripe:customer:${stripeCustomerId}`,
    );

    const parsedSubscriptionData =
      subscriptionDataSchema.safeParse(subscriptionDataKv);
    const subscriptionData = parsedSubscriptionData.data;
    if (!subscriptionData || !subscriptionData.subscriptionId) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Subscription data not found",
      });
    }

    if (!subscriptionData || !subscriptionData.priceIds) {
      throw new Error("No subscription data found for customer");
    }

    const subscriptionTier = await priceIdsToPlan(subscriptionData.priceIds);

    if (!subscriptionTier) {
      throw new Error("Unable to determine subscription tier from price IDs");
    }

    // Get current billing period's meter events
    const currentPeriodStart = new Date(
      subscriptionData.currentPeriodStart * 1000,
    );
    const currentPeriodEnd = new Date(subscriptionData.currentPeriodEnd * 1000);

    if (!currentPeriodStart || !currentPeriodEnd) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No current period start or end found",
      });
    }

    // Fetch meter events for current month
    const meterEvents = await ctx.db.meterEvent.findMany({
      where: {
        customerId: ctx.session.userId,
        createdAt: {
          gte: currentPeriodStart,
          lte: currentPeriodEnd,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate usage by event type
    const holdingUsage = meterEvents
      .filter((event) => event.eventType === "OVERDUE_PACKAGE_HOLDING")
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
        start: currentPeriodStart,
        end: currentPeriodEnd,
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
        eventType: z
          .enum(["OVERDUE_PACKAGE_HOLDING", "PACKAGE_ALLOWANCE"])
          .optional(),
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
