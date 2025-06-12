import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedCustomerProcedure } from "../trpc";

export const orderRouter = createTRPCRouter({
  getAllOrders: protectedCustomerProcedure.query(({ ctx }) => {
    return ctx.db.order.findMany({
      where: {
        OR: [
          // User's own orders
          { customerId: ctx.session.userId },
          // Orders from accounts where user is a trusted contact
          {
            customer: {
              trustedContactsGranted: {
                some: {
                  trustedContactId: ctx.session.userId,
                  status: "ACTIVE",
                },
              },
            },
          },
        ],
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
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
