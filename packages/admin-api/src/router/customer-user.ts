import { z } from "zod";

import { createTRPCRouter, protectedAdminProcedure } from "../trpc";

export const customerUserRouter = createTRPCRouter({
  getCustomerUser: protectedAdminProcedure
    .input(
      z.object({
        orderId: z.number(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return ctx.db.order.findUnique({
        where: {
          id: input.orderId,
        },
        select: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
              shippingAddress: true,
            },
          },
        },
      });
    }),
});
