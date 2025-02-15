import { createTRPCRouter, protectedCustomerProcedure } from "../trpc";

export const orderRouter = createTRPCRouter({
  getAllOrders: protectedCustomerProcedure.query(({ ctx }) => {
    return ctx.db.order.findMany({
      where: {
        customerId: ctx.session.userId,
      },
      include: {
        shippedLocation: {
          select: {
            name: true,
            address: true,
          },
        },
      },
    });
  }),
});
