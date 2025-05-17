import { TRPCError } from "@trpc/server";

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
});
