import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedCorporateProcedure,
  protectedEmployeeProcedure,
  publicProcedure,
} from "../trpc";

export const orderRouter = createTRPCRouter({
  getAllOrders: protectedCorporateProcedure.query(({ ctx }) => {
    console.log("authorized?");
    return ctx.db.order.findMany();
  }),
  getAllOrdersForEmployee: protectedEmployeeProcedure.query(async ({ ctx }) => {
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
    return ctx.db.order.findMany({
      where: {
        shippedLocationId: user.locationId,
      },
    });
  }),
  unprotectedGetAllOrders: publicProcedure.query(({ ctx }) => {
    // TODO: REMOVE
    console.log("running");
    return ctx.db.order.findMany();
  }),
});
