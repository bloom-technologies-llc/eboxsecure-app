import {
  createTRPCRouter,
  protectedCustomerProcedure,
  publicProcedure,
} from "../trpc";

export const orderRouter = createTRPCRouter({
  getAllOrders: protectedCustomerProcedure.query(({ ctx }) => {
    return ctx.db.order.findMany();
  }),
  unprotectedGetAllOrders: publicProcedure.query(({ ctx }) => {
    // TODO: REMOVE
    return ctx.db.order.findMany();
  }),
});
