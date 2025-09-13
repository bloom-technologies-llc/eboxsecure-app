import { clerkClient } from "@clerk/nextjs/server";
import { UserType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import Stripe from "stripe";
import { z } from "zod";

import { kv } from "@ebox/redis-client";
import { priceIdsToPlan, subscriptionDataSchema } from "@ebox/stripe";

import { createTRPCRouter, protectedAdminProcedure } from "../trpc";

const paginationSchema = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(20),
});

export const ordersRouter = createTRPCRouter({
  getAllOrders: protectedAdminProcedure
    .input(paginationSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.userId;
      const userType = await ctx.db.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          userType: true,
        },
      });

      if (!userType) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not found",
        });
      }

      const skip = (input.page - 1) * input.limit;

      if (userType.userType === UserType.CORPORATE) {
        const [orders, totalCount] = await Promise.all([
          ctx.db.order.findMany({
            include: {
              customer: true,
              shippedLocation: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            skip,
            take: input.limit,
          }),
          ctx.db.order.count(),
        ]);

        const totalPages = Math.ceil(totalCount / input.limit);
        const hasNextPage = input.page < totalPages;

        return {
          orders,
          pagination: {
            page: input.page,
            limit: input.limit,
            totalCount,
            totalPages,
            hasNextPage,
          },
        };
      } else if (userType.userType === UserType.EMPLOYEE) {
        const whereClause = {
          shippedLocation: {
            employeeAccounts: {
              some: {
                id: ctx.session.userId,
              },
            },
          },
        };

        const [orders, totalCount] = await Promise.all([
          ctx.db.order.findMany({
            where: whereClause,
            include: {
              customer: true,
              shippedLocation: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            skip,
            take: input.limit,
          }),
          ctx.db.order.count({ where: whereClause }),
        ]);

        const totalPages = Math.ceil(totalCount / input.limit);
        const hasNextPage = input.page < totalPages;

        return {
          orders,
          pagination: {
            page: input.page,
            limit: input.limit,
            totalCount,
            totalPages,
            hasNextPage,
          },
        };
      } else {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid user type",
        });
      }
    }),

  getOrderDetails: protectedAdminProcedure
    .input(
      z.object({
        orderId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userType = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.userId,
        },
        select: {
          userType: true,
        },
      });

      if (!userType) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not found",
        });
      }

      if (userType.userType === UserType.CORPORATE) {
        return await ctx.db.order.findUnique({
          where: {
            id: input.orderId,
          },
          select: {
            id: true,
            shippedLocationId: true,
            customer: true,
            shippedLocation: {
              select: {
                id: true,
              },
            },
          },
        });
      } else if (userType.userType === UserType.EMPLOYEE) {
        const user = await ctx.db.employeeAccount.findUnique({
          where: {
            id: ctx.session.userId,
          },
          select: {
            locationId: true,
          },
        });

        if (!user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not found",
          });
        }

        const order = await ctx.db.order.findUnique({
          where: {
            id: input.orderId,
            shippedLocationId: user.locationId,
          },
          select: {
            id: true,
            shippedLocationId: true,
            customer: true,
            shippedLocation: {
              select: {
                id: true,
              },
            },
          },
        });

        if (!order) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User is unauthorized to access this order",
          });
        }

        return order;
      }

      // Fallback for unexpected user types
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid user type",
      });
    }),
  markOrderAsPickedUp: protectedAdminProcedure
    .input(
      z.object({
        orderId: z.number().positive(),
        customerId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { orderId, customerId } = input;
      const clerk = await clerkClient();
      const user = await clerk.users.getUser(customerId);
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not found",
        });
      }
      const stripeCustomerId = user.privateMetadata.stripeCustomerId as string;
      if (!stripeCustomerId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User does not have a Stripe customer ID",
        });
      }
      const order = await ctx.db.order.findUniqueOrThrow({
        where: {
          id: orderId,
          OR: [
            { customerId },
            {
              OrderSharedAccess: {
                some: {
                  sharedWithId: customerId,
                },
              },
            },
          ],
        },
      });

      if (!order) {
        console.error(
          `Order ID ${input.orderId} was not found, possibly because it is not owned or share with customer ID# ${customerId}.`,
        );
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "This order was not found.",
        });
      }

      if (order.pickedUpAt) {
        console.error(`Order ID ${input.orderId} was already picked up.`);
        throw new TRPCError({
          code: "CONFLICT",
          message: "This order has already been picked up.",
        });
      }

      if (!order.deliveredDate) {
        console.error(`Order ID ${input.orderId} was not delivered.`);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This order was not delivered.",
        });
      }

      await ctx.db.order.update({
        where: {
          id: input.orderId,
        },
        data: {
          pickedUpAt: new Date(),
          pickedUpBy: {
            connect: {
              id: customerId,
            },
          },
        },
      });

      const subscriptionDataKv = await kv.get(
        `stripe:customer:${stripeCustomerId}`,
      );

      const parsedSubData =
        subscriptionDataSchema.safeParse(subscriptionDataKv);

      if (!parsedSubData.success) {
        return false;
      }

      const subscriptionData = parsedSubData.data;
      const plan = await priceIdsToPlan(subscriptionData.priceIds);
      if (!plan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Unable to determine subscription tier from price IDs",
        });
      }
      const allowedHoldingPeriod =
        await ctx.db.subscriptionLimit.findUniqueOrThrow({
          where: {
            type: plan,
          },
          select: {
            maxPackageHolding: true,
          },
        });
      const maxHoldingDays = allowedHoldingPeriod.maxPackageHolding;

      const numDaysHeld = Math.ceil(
        (new Date().getTime() - order.deliveredDate.getTime()) /
          (1000 * 60 * 60 * 24),
      );
      const overdueDays = numDaysHeld - maxHoldingDays;
      if (overdueDays > 0) {
        // Send Stripe metering event
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

        const meterEvent = await stripe.billing.meterEvents.create({
          event_name: "ferris_credits",
          payload: {
            value: overdueDays.toString(),
            stripe_customer_id: stripeCustomerId,
          },
        });
        await ctx.db.meterEvent.create({
          data: {
            eventType: "OVERDUE_PACKAGE_HOLDING",
            value: overdueDays,
            customerId: stripeCustomerId,
            orderId: order.id,
          },
        });
      }
    }),
});
