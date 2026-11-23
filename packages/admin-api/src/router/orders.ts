import type { Prisma } from "@prisma/client";
import { UserType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import Stripe from "stripe";
import { z } from "zod";

import { NotificationService } from "@ebox/notifications";
import { kv } from "@ebox/redis-client";
import {
  getStripeCustomerId,
  priceIdsToPlan,
  SUBSCRIPTION_LIMITS,
  subscriptionDataSchema,
} from "@ebox/stripe";

import { createTRPCRouter, protectedAdminProcedure } from "../trpc";

export const ORDER_STATUSES = [
  "ORDERED",
  "READY_FOR_PICKUP",
  "PICKED_UP",
  "CANCELLED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

const listOrdersSchema = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(20),
  search: z.string().trim().max(100).optional(),
  status: z.enum(ORDER_STATUSES).optional(),
  sortBy: z
    .enum(["order_number", "date", "total_price", "customer_name"])
    .optional()
    .default("date"),
  sortDirection: z.enum(["asc", "desc"]).optional().default("desc"),
});

// Order status is derived from the lifecycle timestamps rather than stored.
// A cancelled order is "Cancelled" unless it was already handed over.
const statusWhere = (status: OrderStatus): Prisma.OrderWhereInput => {
  switch (status) {
    case "PICKED_UP":
      return { pickedUpAt: { not: null } };
    case "CANCELLED":
      return { pickedUpAt: null, cancelledAt: { not: null } };
    case "READY_FOR_PICKUP":
      return {
        pickedUpAt: null,
        cancelledAt: null,
        deliveredDate: { not: null },
      };
    case "ORDERED":
      return { pickedUpAt: null, cancelledAt: null, deliveredDate: null };
  }
};

const searchWhere = (search: string): Prisma.OrderWhereInput => {
  const contains = { contains: search, mode: "insensitive" as const };
  const or: Prisma.OrderWhereInput[] = [
    { vendorOrderId: contains },
    { trackingNumber: contains },
    { customer: { firstName: contains } },
    { customer: { lastName: contains } },
    { customer: { email: contains } },
    { shippedLocation: { name: contains } },
  ];
  // "First Last" typed as one term
  const [first, ...rest] = search.split(/\s+/);
  if (first && rest.length > 0) {
    or.push({
      customer: {
        firstName: { contains: first, mode: "insensitive" },
        lastName: { contains: rest.join(" "), mode: "insensitive" },
      },
    });
  }
  const orderId = /^#?(\d{1,9})$/.exec(search)?.[1];
  if (orderId) {
    or.push({ id: Number(orderId) });
  }
  return { OR: or };
};

export const ordersRouter = createTRPCRouter({
  getAllOrders: protectedAdminProcedure
    .input(listOrdersSchema)
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

      const filters: Prisma.OrderWhereInput[] = [];

      // Corporate sees every location; employees only their own.
      if (userType.userType === UserType.EMPLOYEE) {
        filters.push({
          shippedLocation: {
            employeeAccounts: {
              some: {
                id: ctx.session.userId,
              },
            },
          },
        });
      } else if (userType.userType !== UserType.CORPORATE) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid user type",
        });
      }

      if (input.status) filters.push(statusWhere(input.status));
      if (input.search) filters.push(searchWhere(input.search));

      const where: Prisma.OrderWhereInput = { AND: filters };

      const orderBy: Prisma.OrderOrderByWithRelationInput[] =
        input.sortBy === "order_number"
          ? [{ id: input.sortDirection }]
          : input.sortBy === "total_price"
            ? [{ total: input.sortDirection }, { id: "desc" }]
            : input.sortBy === "customer_name"
              ? [
                  { customer: { lastName: input.sortDirection } },
                  { customer: { firstName: input.sortDirection } },
                  { id: "desc" },
                ]
              : [{ createdAt: input.sortDirection }, { id: "desc" }];

      const skip = (input.page - 1) * input.limit;

      const [orders, totalCount] = await Promise.all([
        ctx.db.order.findMany({
          where,
          include: {
            customer: true,
            shippedLocation: true,
          },
          orderBy,
          skip,
          take: input.limit,
        }),
        ctx.db.order.count({ where }),
      ]);

      const totalPages = Math.ceil(totalCount / input.limit);

      return {
        orders,
        pagination: {
          page: input.page,
          limit: input.limit,
          totalCount,
          totalPages,
          hasNextPage: input.page < totalPages,
        },
      };
    }),

  getAllOrdersForEmployee: protectedAdminProcedure.query(async ({ ctx }) => {
    // Return ALL orders scoped to the current employee's location. The
    // dashboard computes its metrics client-side (counts, "processed today",
    // recent activity), so this intentionally is NOT paginated.
    const whereClause = {
      shippedLocation: {
        employeeAccounts: {
          some: {
            id: ctx.session.userId,
          },
        },
      },
    };

    return await ctx.db.order.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
    });
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
            vendorOrderId: true,
            trackingNumber: true,
            sourceChannel: true,
            total: true,
            createdAt: true,
            deliveredDate: true,
            pickedUpAt: true,
            cancelledAt: true,
            customer: true,
            shippedLocation: {
              select: {
                id: true,
                name: true,
                address: true,
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
            vendorOrderId: true,
            trackingNumber: true,
            sourceChannel: true,
            total: true,
            createdAt: true,
            deliveredDate: true,
            pickedUpAt: true,
            cancelledAt: true,
            customer: true,
            shippedLocation: {
              select: {
                id: true,
                name: true,
                address: true,
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

      // `customerId` is the person collecting the package: the order owner or
      // a trusted contact the order was shared with.
      const order = await ctx.db.order.findFirst({
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

      // Location employees may only hand over packages held at their own
      // location; corporate users may act on any location.
      const employee = await ctx.db.employeeAccount.findUnique({
        where: { id: ctx.session.userId },
        select: { locationId: true },
      });
      if (employee && employee.locationId !== order.shippedLocationId) {
        console.error(
          `Employee ${ctx.session.userId} (location ${employee.locationId}) attempted to pick up Order ID ${order.id} held at location ${order.shippedLocationId}.`,
        );
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This order is held at a different location.",
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

      // Conditional update so two simultaneous scans cannot both succeed.
      const { count } = await ctx.db.order.updateMany({
        where: { id: order.id, pickedUpAt: null },
        data: { pickedUpAt: new Date(), pickedUpById: customerId },
      });
      if (count === 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This order has already been picked up.",
        });
      }

      // Send pickup notification to the order owner
      const notificationService = new NotificationService(ctx.db);
      await notificationService.send({
        userId: order.customerId,
        type: "ORDER_PICKED_UP",
        message: `Your package (Order #${input.orderId}) has been picked up.`,
        orderId: input.orderId,
      });

      // Overdue holding is billed to the order OWNER (on the owner's plan and
      // holding allowance), even when a trusted contact collects the package.
      const stripeCustomerId = await getStripeCustomerId(order.customerId);
      if (!stripeCustomerId) {
        console.error(
          `Order ID ${order.id} owner ${order.customerId} has no Stripe customer; skipping overdue holding check.`,
        );
        return false;
      }

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
      const maxHoldingDays =
        SUBSCRIPTION_LIMITS[plan.subscriptionType].maxPackageHolding;

      const numDaysHeld = Math.ceil(
        (new Date().getTime() - order.deliveredDate.getTime()) /
          (1000 * 60 * 60 * 24),
      );
      const overdueDays = numDaysHeld - maxHoldingDays;
      if (overdueDays > 0) {
        console.log(
          `Order ID ${input.orderId} is overdue by ${overdueDays} days. Sending Stripe metering event.`,
        );
        // Send Stripe metering event
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

        const meterEvent = await stripe.billing.meterEvents.create({
          event_name: "overdue_package_holding",
          payload: {
            value: overdueDays.toString(),
            stripe_customer_id: stripeCustomerId,
          },
        });
        await ctx.db.meterEvent.create({
          data: {
            eventType: "OVERDUE_PACKAGE_HOLDING",
            value: overdueDays,
            customerId: order.customerId,
            orderId: order.id,
          },
        });

        await notificationService.send({
          userId: order.customerId,
          type: "ORDER_OVERDUE",
          message: `Your package (Order #${input.orderId}) was overdue by ${overdueDays} day(s). An overdue holding fee has been applied.`,
          orderId: input.orderId,
        });
      }
    }),
});
