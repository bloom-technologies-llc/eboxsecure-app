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
    if (userType?.userType === "CORPORATE") {
      return await ctx.db.order.findMany({
        include: {
          customer: true,
          shippedLocation: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      const employee = await ctx.db.employeeAccount.findUnique({
        where: {
          id: ctx.session.userId,
        },
        select: {
          locationId: true,
        },
      });
      if (!employee) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Employee account not found",
        });
      }
      return await ctx.db.order.findMany({
        where: {
          shippedLocationId: employee.locationId,
        },
        include: {
          customer: true,
          shippedLocation: true,
        },
        orderBy: {
          createdAt: "desc",
        },
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

      if (order?.shippedLocationId !== user.locationId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Order cannot be accessed",
        });
      }

      return order;
    }),
});
