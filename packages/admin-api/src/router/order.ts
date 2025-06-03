import {
  createTRPCRouter,
  protectedCorporateProcedure,
  publicProcedure,
} from "../trpc";

export const orderRouter = createTRPCRouter({
  getAllOrders: protectedCorporateProcedure.query(({ ctx }) => {
    console.log("authorized?");
    return ctx.db.order.findMany();
  }),
  unprotectedGetAllOrders: publicProcedure.query(({ ctx }) => {
    // TODO: REMOVE
    console.log("running");
    return ctx.db.order.findMany();
  }),
});
