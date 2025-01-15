import {
  createTRPCRouter,
  protectedCorporateProcedure,
  publicProcedure,
} from "../trpc";

export const orderRouter = createTRPCRouter({
  getAllOrders: protectedCorporateProcedure.query(({ ctx }) => {
    return ctx.db.order.findMany();
  }),
  unprotectedGetAllOrders: publicProcedure.query(({ ctx }) => {
    // TODO: REMOVE
    return ctx.db.order.findMany();
  }),
});
