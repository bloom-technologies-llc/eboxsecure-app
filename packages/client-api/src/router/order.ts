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
            OrderSharedAccess: {
              some: {
                sharedWithId: ctx.session.userId,
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
              OrderSharedAccess: {
                some: {
                  sharedWithId: ctx.session.userId,
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
  share: protectedCustomerProcedure
    .input(
      z.object({
        orderId: z.number().nonnegative(),
        trustedContactId: z.string(), // must be a CustomerAccount.id
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { orderId, trustedContactId } = input;
      const userId = ctx.session.userId;

      // 1. Check the order belongs to the current user
      const order = await ctx.db.order.findFirst({
        where: {
          id: orderId,
          customerId: userId,
        },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found or you are not the owner.",
        });
      }

      // 2. Check that trustedContactId is an ACTIVE trusted contact of the caller
      const isTrusted = await ctx.db.trustedContact.findUnique({
        where: {
          accountHolderId_trustedContactId: {
            accountHolderId: userId,
            trustedContactId,
          },
        },
      });

      if (!isTrusted || isTrusted.status !== "ACTIVE") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This user is not an active trusted contact.",
        });
      }

      // 3. Create the share (if it doesn't already exist)
      const existingShare = await ctx.db.orderSharedAccess.findUnique({
        where: {
          orderId_sharedWithId: {
            orderId,
            sharedWithId: trustedContactId,
          },
        },
      });

      if (existingShare) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This order has already been shared with the contact.",
        });
      }

      // 4. Create the share
      const orderShare = await ctx.db.orderSharedAccess.create({
        data: {
          orderId,
          sharedWithId: trustedContactId,
          grantedById: userId,
        },
      });

      return orderShare;
    }),
  unshare: protectedCustomerProcedure
    .input(
      z.object({
        orderId: z.number().nonnegative(),
        trustedContactId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { orderId, trustedContactId } = input;
      const userId = ctx.session.userId;

      // 1. Verify the order belongs to the caller
      const order = await ctx.db.order.findFirst({
        where: {
          id: orderId,
          customerId: userId,
        },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found or you are not the owner.",
        });
      }

      // 2. Check if the order is shared with the contact
      const share = await ctx.db.orderSharedAccess.findUnique({
        where: {
          orderId_sharedWithId: {
            orderId,
            sharedWithId: trustedContactId,
          },
        },
      });

      if (!share) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No share exists for this order and trusted contact.",
        });
      }

      // 3. Delete the share
      await ctx.db.orderSharedAccess.delete({
        where: {
          orderId_sharedWithId: {
            orderId,
            sharedWithId: trustedContactId,
          },
        },
      });

      return { success: true };
    }),
});
