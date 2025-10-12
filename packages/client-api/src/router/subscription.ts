import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { SubscriptionType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import Stripe from "stripe";
import { z } from "zod";

import { db } from "@ebox/db";
import { kv } from "@ebox/redis-client";
import {
  getScheduledChangeType,
  getScheduledPlanInfo,
  getStripeCustomerId,
  hasValidSubscription,
  priceIdsToPlan,
  subscriptionDataSchema,
} from "@ebox/stripe";

import { createTRPCRouter, protectedCustomerProcedure } from "../trpc";

export const subscriptionRouter = createTRPCRouter({
  subscribe: protectedCustomerProcedure
    .input(
      z.object({
        lookupKey: z.string(), // takes in lookup key with or without _yearly
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Validate lookup key
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

      const priceValidation = await stripe.prices.list({
        lookup_keys: [input.lookupKey.toLowerCase()],
        limit: 1,
      });

      if (priceValidation.data.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid lookup key provided",
        });
      }

      const url = await createStripeSession(input.lookupKey.toLowerCase());
      return { url };
    }),
  cancelSubscription: protectedCustomerProcedure.mutation(async ({ ctx }) => {
    const customerId = await getStripeCustomerId(ctx.session.userId);
    if (!customerId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Customer ID not found",
      });
    }

    const subscriptionDataKv = await kv.get(`stripe:customer:${customerId}`);
    const parsedSubscriptionData =
      subscriptionDataSchema.safeParse(subscriptionDataKv);
    const subscriptionData = parsedSubscriptionData.data;
    if (!subscriptionData || !subscriptionData.subscriptionId) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Subscription data not found",
      });
    }

    if (subscriptionData.status !== "active") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Subscription is not active",
      });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    // if user has any downgrades scheduled, cancel them
    const schedules = await stripe.subscriptionSchedules.list({
      customer: customerId,
    });

    if (schedules.data.length > 0) {
      for (const schedule of schedules.data) {
        if (schedule.status === "active") {
          await stripe.subscriptionSchedules.release(schedule.id);
        }
      }
    }

    // Cancel at period end (soft cancel)
    await stripe.subscriptions.update(subscriptionData.subscriptionId, {
      cancel_at_period_end: true,
    });

    return { success: true };
  }),
  createBillingPortalSession: protectedCustomerProcedure.mutation(
    async ({ ctx }) => {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

      const stripeCustomerId = await getStripeCustomerId(ctx.session.userId);

      if (!stripeCustomerId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Customer ID not found",
        });
      }

      const baseUrl = process.env.BASE_URL;
      const session = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: `${baseUrl}/settings/subscription`,
      });

      if (!session.url) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create billing portal session",
        });
      }

      return { url: session.url };
    },
  ),
  upgradeSubscription: protectedCustomerProcedure
    .input(
      z.object({
        targetTier: z.nativeEnum(SubscriptionType),
        billingPeriod: z.enum(["month", "year"]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { targetTier } = input;
      const customerId = await getStripeCustomerId(ctx.session.userId);
      if (!customerId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Customer ID not found",
        });
      }
      const subscriptionDataKv = await kv.get(`stripe:customer:${customerId}`);
      const parsedSubscriptionData =
        subscriptionDataSchema.safeParse(subscriptionDataKv);
      const subscriptionData = parsedSubscriptionData.data;
      if (!subscriptionData || !subscriptionData.subscriptionId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription data not found",
        });
      }

      // Validate that user has an active subscription
      if (
        subscriptionData.status !== "active" ||
        !subscriptionData.subscriptionId
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No active subscription found to upgrade",
        });
      }

      const plan = await priceIdsToPlan(subscriptionData.priceIds);
      const currentPlanBillingPeriod = plan?.isYearly ? "year" : "month";
      if (currentPlanBillingPeriod !== input.billingPeriod) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot upgrade to a different billing period",
        });
      }
      // Validate that this is actually a plan change
      if (plan?.subscriptionType === targetTier) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are already subscribed to this plan",
        });
      }

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

      try {
        // Set proration date to this moment for consistency
        const proration_date = Math.floor(Date.now() / 1000);

        // Get current subscription details
        const currentSubscription = await stripe.subscriptions.retrieve(
          subscriptionData.subscriptionId,
          {
            expand: ["items.data.price"],
          },
        );

        // Get target tier pricing
        const lookupKey =
          input.billingPeriod === "year"
            ? targetTier.toLowerCase() + "_yearly"
            : targetTier.toLowerCase();
        const lookupKeys = [
          lookupKey,
          lookupKey + "_allowance",
          lookupKey + "_overdue_holding",
        ];
        const targetPrices = await stripe.prices.list({
          lookup_keys: lookupKeys,
        });

        // Map existing subscription items to new prices
        // This follows the pattern from Stripe docs: items should have id and price
        const subscriptionItems = currentSubscription.items.data.map(
          (item, index) => {
            // Find corresponding target price by index or lookup key
            const targetPrice = targetPrices.data[index];
            if (!targetPrice) {
              throw new Error(
                `No target price found for subscription item ${item.id}`,
              );
            }

            return {
              id: item.id,
              price: targetPrice.id,
              // Only include quantity for non-metered items
              ...(targetPrice.recurring?.usage_type !== "metered" && {
                quantity: item.quantity || 1,
              }),
            };
          },
        );

        // if user has any downgrades scheduled, cancel them
        const schedules = await stripe.subscriptionSchedules.list({
          customer: customerId,
        });

        if (schedules.data.length > 0) {
          for (const schedule of schedules.data) {
            if (schedule.status === "active") {
              await stripe.subscriptionSchedules.release(schedule.id);
            }
          }
        }

        const updatedSubscription = await stripe.subscriptions.update(
          subscriptionData.subscriptionId,
          {
            items: subscriptionItems,
            proration_behavior: "always_invoice",
            proration_date: proration_date,
          },
        );

        return {
          success: true,
          message: `Successfully upgraded to ${targetTier}`,
          subscription: updatedSubscription,
        };
      } catch (error) {
        if (error instanceof Stripe.errors.StripeError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Stripe error: ${error.message}`,
          });
        }

        // Show the actual error details for debugging
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to process upgrade: ${errorMessage}`,
        });
      }
    }),
  downgradeSubscription: protectedCustomerProcedure
    .input(
      z.object({
        targetTier: z.nativeEnum(SubscriptionType),
        billingPeriod: z.enum(["month", "year"]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { targetTier } = input;
      const customerId = await getStripeCustomerId(ctx.session.userId);
      if (!customerId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Customer ID not found",
        });
      }

      const subscriptionDataKv = await kv.get(`stripe:customer:${customerId}`);
      const parsedSubscriptionData =
        subscriptionDataSchema.safeParse(subscriptionDataKv);
      const subscriptionData = parsedSubscriptionData.data;
      if (!subscriptionData || !subscriptionData.subscriptionId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription data not found",
        });
      }

      if (subscriptionData.status !== "active") {
        throw new Error("No active subscription found to downgrade");
      }
      const plan = await priceIdsToPlan(subscriptionData.priceIds);

      if (plan?.subscriptionType === targetTier) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are already subscribed to this plan",
        });
      }
      const currentPlanBillingPeriod = plan?.isYearly ? "year" : "month";
      if (currentPlanBillingPeriod !== input.billingPeriod) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot downgrade to a different billing period",
        });
      }
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

      // before proceeding, cancel any existing downgrades
      // if user has any downgrades scheduled, cancel them
      const schedules = await stripe.subscriptionSchedules.list({
        customer: customerId,
      });

      if (schedules.data.length > 0) {
        for (const schedule of schedules.data) {
          if (schedule.status === "active") {
            await stripe.subscriptionSchedules.release(schedule.id);
          }
        }
      }
      try {
        // Retrieve current subscription with schedule information
        const currentSubscription = await stripe.subscriptions.retrieve(
          subscriptionData.subscriptionId,
          {
            expand: ["items.data.price", "schedule"],
          },
        );

        if (!subscriptionData.currentPeriodEnd) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Current period end not found",
          });
        }

        const effectiveDate = new Date(
          subscriptionData.currentPeriodEnd * 1000,
        );

        // Get target tier pricing
        const lookupKey =
          input.billingPeriod === "year"
            ? targetTier.toLowerCase() + "_yearly"
            : targetTier.toLowerCase();
        const lookupKeys = [
          lookupKey,
          lookupKey + "_allowance",
          lookupKey + "_overdue_holding",
        ];
        const targetPrices = await stripe.prices.list({
          lookup_keys: lookupKeys,
        });

        // Build subscription items for target tier (handles usage meters)
        const targetSubscriptionItems = lookupKeys.map((key) => {
          const price = targetPrices.data.find((p) => p.lookup_key === key);
          if (!price) {
            throw new Error(
              `Price not found for lookup key: during downgrade ${key}`,
            );
          }

          // For metered usage (like package holding/allowance), don't specify quantity
          if (price.recurring?.usage_type === "metered") {
            return { price: price.id };
          }

          // For regular subscriptions, include quantity
          return { price: price.id, quantity: 1 };
        });

        if (currentSubscription.schedule) {
          const scheduleId =
            typeof currentSubscription.schedule === "string"
              ? currentSubscription.schedule
              : currentSubscription.schedule.id;

          // Get the current schedule to preserve existing phase structure
          const currentSchedule =
            await stripe.subscriptionSchedules.retrieve(scheduleId);
          const currentPhase = currentSchedule.phases[0];

          await stripe.subscriptionSchedules.update(scheduleId, {
            phases: [
              {
                items: currentSubscription.items.data.map((item) => ({
                  price: item.price.id,
                  quantity: item.quantity || undefined,
                })),
                start_date: currentPhase?.start_date,
                end_date: subscriptionData.currentPeriodEnd,
                proration_behavior: "none",
              },
              {
                items: targetSubscriptionItems,
                start_date: subscriptionData.currentPeriodEnd,
                proration_behavior: "none",
              },
            ],
          });
        } else {
          // Create new schedule from existing subscription
          const newSchedule = await stripe.subscriptionSchedules.create({
            from_subscription: subscriptionData.subscriptionId,
          });

          await stripe.subscriptionSchedules.update(newSchedule.id, {
            end_behavior: "release",
            phases: [
              {
                items: currentSubscription.items.data.map((item) => ({
                  price: item.price.id,
                  quantity: item.quantity || undefined,
                })),
                start_date: newSchedule.phases[0]?.start_date,
                end_date: subscriptionData.currentPeriodEnd,
                proration_behavior: "none",
              },
              {
                items: targetSubscriptionItems,
                start_date: subscriptionData.currentPeriodEnd,
                proration_behavior: "none",
              },
            ],
          });
        }

        return {
          success: true,
          message: `Downgrade to ${targetTier} scheduled for next billing cycle`,
          effectiveDate,
        };
      } catch (error) {
        console.error("Error scheduling downgrade:", error);

        if (error instanceof Stripe.errors.StripeError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Stripe error: ${error.message}`,
          });
        }

        const errorMessage =
          error instanceof Error ? error.message : String(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to schedule downgrade: ${errorMessage}`,
        });
      }
    }),
  reactivateSubscription: protectedCustomerProcedure.mutation(
    async ({ ctx }) => {
      const customerId = await getStripeCustomerId(ctx.session.userId);
      if (!customerId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Customer ID not found",
        });
      }

      const subscriptionDataKv = await kv.get(`stripe:customer:${customerId}`);
      const parsedSubscriptionData =
        subscriptionDataSchema.safeParse(subscriptionDataKv);
      const subscriptionData = parsedSubscriptionData.data;
      if (!subscriptionData || !subscriptionData.subscriptionId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription data not found",
        });
      }

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

      // Remove cancellation
      await stripe.subscriptions.update(subscriptionData.subscriptionId, {
        cancel_at_period_end: false,
      });

      return { success: true };
    },
  ),
  getCurrentPlan: protectedCustomerProcedure.query(async ({ ctx }) => {
    const stripeCustomerId = await getStripeCustomerId(ctx.session.userId);
    if (!stripeCustomerId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Customer ID not found",
      });
    }
    const subscriptionDataKv = await kv.get(
      `stripe:customer:${stripeCustomerId}`,
    );
    const subscriptionData = subscriptionDataSchema.parse(subscriptionDataKv);

    const priceIds = subscriptionData.priceIds;
    const plan = await priceIdsToPlan(priceIds);
    if (!plan) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Plan not found",
      });
    }
    // Get scheduled plan information if available
    const scheduledPlanInfo = await getScheduledPlanInfo(subscriptionData);
    const price = getPrice(plan.subscriptionType, plan.isYearly);

    if (!subscriptionData || !price) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Plan, subscription data, or price not found",
      });
    }

    return {
      plan,
      subscriptionData,
      price,
      billingPeriod: plan.isYearly ? "year" : ("month" as "year" | "month"),
      scheduledPlan: scheduledPlanInfo
        ? {
            plan: scheduledPlanInfo.plan,
            price: getPrice(
              scheduledPlanInfo.plan.subscriptionType,
              scheduledPlanInfo.plan.isYearly,
            ),
            startDate: scheduledPlanInfo.startDate,
            changeType:
              plan && scheduledPlanInfo.plan
                ? getScheduledChangeType(
                    plan.subscriptionType,
                    scheduledPlanInfo.plan.subscriptionType,
                  )
                : "none",
          }
        : null,
    };
  }),
  cancelDowngrade: protectedCustomerProcedure.mutation(async ({ ctx }) => {
    const customerId = await getStripeCustomerId(ctx.session.userId);

    if (!customerId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Customer ID not found",
      });
    }

    const subscriptionDataKv = await kv.get(`stripe:customer:${customerId}`);
    const parsedSubscriptionData =
      subscriptionDataSchema.safeParse(subscriptionDataKv);
    const subscriptionData = parsedSubscriptionData.data;
    if (!subscriptionData || !subscriptionData.subscriptionId) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Subscription data not found",
      });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    // if user has any downgrades scheduled, cancel them
    const schedules = await stripe.subscriptionSchedules.list({
      customer: customerId,
    });

    if (schedules.data.length > 0) {
      for (const schedule of schedules.data) {
        if (schedule.status === "active") {
          await stripe.subscriptionSchedules.release(schedule.id);
        }
      }
    }
  }),
  changeBillingPeriod: protectedCustomerProcedure
    .input(
      z.object({
        billingPeriod: z.enum(["month", "year"]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const customerId = await getStripeCustomerId(ctx.session.userId);
      if (!customerId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Customer ID not found",
        });
      }
      const subscriptionDataKv = await kv.get(`stripe:customer:${customerId}`);
      const parsedSubscriptionData =
        subscriptionDataSchema.safeParse(subscriptionDataKv);
      const subscriptionData = parsedSubscriptionData.data;
      if (!subscriptionData || !subscriptionData.subscriptionId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription data not found",
        });
      }

      // Validate that user has an active subscription
      if (
        subscriptionData.status !== "active" ||
        !subscriptionData.subscriptionId
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No active subscription found to upgrade",
        });
      }

      const plan = await priceIdsToPlan(subscriptionData.priceIds);
      if (!plan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Plan not found",
        });
      }
      const currentPlanBillingPeriod = plan?.isYearly ? "year" : "month";
      if (currentPlanBillingPeriod === input.billingPeriod) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "You cannot change to the same billing period as your current plan",
        });
      }

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

      try {
        const lookupKey =
          input.billingPeriod === "year"
            ? plan.subscriptionType.toLowerCase() + "_yearly"
            : plan.subscriptionType.toLowerCase();
        const lookupKeys = [
          lookupKey,
          lookupKey + "_allowance",
          lookupKey + "_overdue_holding",
        ];
        const targetPrices = await stripe.prices.list({
          lookup_keys: lookupKeys,
        });

        // before proceeding, cancel any existing scheduled changes
        const schedules = await stripe.subscriptionSchedules.list({
          customer: customerId,
        });

        if (schedules.data.length > 0) {
          for (const schedule of schedules.data) {
            if (schedule.status === "active") {
              await stripe.subscriptionSchedules.release(schedule.id);
            }
          }
        }

        // Validate that all target prices exist
        if (targetPrices.data.length !== lookupKeys.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Some target prices not found for billing period change",
          });
        }

        // Build subscription items for target tier (handles usage meters)
        const targetSubscriptionItems = lookupKeys.map((key) => {
          const price = targetPrices.data.find((p) => p.lookup_key === key);
          if (!price) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: `Price not found for lookup key: ${key}`,
            });
          }

          // For metered usage (like package holding/allowance), don't specify quantity
          if (price.recurring?.usage_type === "metered") {
            return { price: price.id };
          }

          // For regular subscriptions, include quantity
          return { price: price.id, quantity: 1 };
        });

        // Get current subscription details
        const currentSubscription = await stripe.subscriptions.retrieve(
          subscriptionData.subscriptionId,
          {
            expand: ["items.data.price"],
          },
        );
        // Create new schedule from existing subscription
        const newSchedule = await stripe.subscriptionSchedules.create({
          from_subscription: subscriptionData.subscriptionId,
        });

        await stripe.subscriptionSchedules.update(newSchedule.id, {
          end_behavior: "release",
          phases: [
            {
              items: currentSubscription.items.data.map((item) => ({
                price: item.price.id,
                quantity: item.quantity || undefined,
              })),
              start_date: newSchedule.phases[0]?.start_date,
              end_date: subscriptionData.currentPeriodEnd,
              proration_behavior: "none",
            },
            {
              items: targetSubscriptionItems,
              start_date: subscriptionData.currentPeriodEnd,
              proration_behavior: "none",
            },
          ],
        });

        return {
          success: true,
          message: `Billing period change to ${input.billingPeriod} scheduled for next billing cycle`,
          effectiveDate: new Date(subscriptionData.currentPeriodEnd * 1000),
        };
      } catch (error) {
        console.error("Error scheduling billing period change:", error);

        if (error instanceof Stripe.errors.StripeError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Stripe error: ${error.message}`,
          });
        }

        const errorMessage =
          error instanceof Error ? error.message : String(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to schedule billing period change: ${errorMessage}`,
        });
      }
    }),
  isSubscribed: protectedCustomerProcedure.query(async ({ ctx }) => {
    const customerId = await getStripeCustomerId(ctx.session.userId);
    if (!customerId) {
      return false;
    }
    return await hasValidSubscription(customerId);
  }),
});

const createStripeSession = async (lookupKey: string) => {
  const user = await currentUser();

  if (!user) {
    throw new Error("User not found");
  }

  let stripeCustomerId = await getStripeCustomerId(user.id);

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

    // add Stripe customer ID to clerk metadata for utility
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(user.id, {
      privateMetadata: {
        stripeCustomerId: newCustomer.id,
      },
    });
    // add Stripe customer ID to db for most use cases
    await db.customerAccount.update({
      where: {
        id: user.id,
      },
      data: {
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
      throw new Error(
        `Price not found for lookup key during stripe session creation: ${key}`,
      );
    }

    // For metered subscriptions, don't include quantity
    if (price.recurring?.usage_type === "metered") {
      return { price: price.id };
    }

    // For regular subscriptions, include quantity
    return { price: price.id, quantity: 1 };
  });

  const baseUrl = process.env.BASE_URL;
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

// TODO: make stripe call or keep in db or something
const getPrice = (plan: SubscriptionType | null, isYearly: boolean) => {
  if (!plan) {
    return -1;
  }
  const prices = {
    [SubscriptionType.BASIC]: {
      month: 9.99,
      year: 102,
    },
    [SubscriptionType.BASIC_PLUS]: {
      month: 19.99,
      year: 204,
    },
    [SubscriptionType.PREMIUM]: {
      month: 49.99,
      year: 510,
    },
    [SubscriptionType.BUSINESS_PRO]: {
      month: 99.99,
      year: 1020,
    },
  };
  return prices[plan][isYearly ? "year" : "month"];
};
