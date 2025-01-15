import type { TRPCRouterRecord } from "@trpc/server";

import { protectedCustomerProcedure, publicProcedure } from "../trpc";

export const orderRouter = {
  getAllOrders: protectedCustomerProcedure.query(({ ctx }) => {
    return ctx.db.order.findMany();
  }),
  unprotectedGetAllOrders: publicProcedure.query(({ ctx }) => {
    // TODO: REMOVE
    return ctx.db.order.findMany();
  }),
} satisfies TRPCRouterRecord;
