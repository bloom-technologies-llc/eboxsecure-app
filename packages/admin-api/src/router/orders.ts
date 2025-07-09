import { UserType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

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
      const order = await ctx.db.order.findUniqueOrThrow({
        where: {
          id: orderId,
          customerId, // TODO: trusted contact
        },
      });

      if (order.pickedUpAt) {
        console.error(`Order ID ${input.orderId} was already picked up.`);
        throw new TRPCError({
          code: "CONFLICT",
          message: "This order has already been picked up.",
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
    }),
});
