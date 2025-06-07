import { UserType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedAdminProcedure } from "../trpc";

export const ordersRouter = createTRPCRouter({
  getAllOrders: protectedAdminProcedure.query(async ({ ctx }) => {
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

    if (userType.userType === UserType.CORPORATE) {
      return await ctx.db.order.findMany({
        include: {
          customer: true,
          shippedLocation: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else if (userType.userType === UserType.EMPLOYEE) {
      const availableOrdersBasedOnStoreLocation = await ctx.db.order.findMany({
        where: {
          shippedLocation: {
            employeeAccounts: {
              some: {
                id: ctx.session.userId,
              },
            },
          },
        },
        include: {
          customer: true,
          shippedLocation: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return availableOrdersBasedOnStoreLocation;
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
});
