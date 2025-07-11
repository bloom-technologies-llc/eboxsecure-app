import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedCustomerProcedure } from "../trpc";

export const orderRouter = createTRPCRouter({
  getAllOrders: protectedCustomerProcedure.query(async ({ ctx }) => {
    const orders = await ctx.db.order.findMany({
      where: {
        OR: [
          // User's own orders
          { customerId: ctx.session.userId },
          // TODO: update trusted contact logic
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
      orderBy: [
        {
          pickedUpAt: {
            sort: "desc",
            nulls: "first",
          },
        },
      ],
    });

    return orders;
  }),
  get: protectedCustomerProcedure
    .input(
      z.object({
        orderId: z.number().nonnegative(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.order.findUnique({
        where: {
          id: input.orderId,
          OR: [
            // User's own orders
            { customerId: ctx.session.userId },
            // TODO: update trusted contact logic
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
              phoneNumber: true,
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
