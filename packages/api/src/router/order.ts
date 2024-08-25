import type { TRPCRouterRecord } from "@trpc/server";

import { protectedProcedure, publicProcedure } from "../trpc";

export const orderRouter = {
  getAllOrders: protectedProcedure.query(({ ctx }) => {
    return ctx.db.order.findMany();
  }),
  unprotectedGetAllOrders: publicProcedure.query(({ ctx }) => {
    return ctx.db.order.findMany();
  }),
} satisfies TRPCRouterRecord;
