import { z } from "zod";

import { createTRPCRouter, protectedCustomerProcedure } from "../trpc";

export const notificationRouter = createTRPCRouter({
  getNotifications: protectedCustomerProcedure
    .input(
      z
        .object({
          cursor: z.string().optional(),
          limit: z.number().min(1).max(50).optional().default(20),
        })
        .optional()
        .default({}),
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input;

      const notifications = await ctx.db.notification.findMany({
        where: { userId: ctx.session.userId },
        include: {
          order: {
            select: {
              id: true,
              vendorOrderId: true,
              shippedLocation: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });

      let nextCursor: string | undefined;
      if (notifications.length > limit) {
        const nextItem = notifications.pop();
        nextCursor = nextItem?.id;
      }

      return { notifications, nextCursor };
    }),

  getUnreadCount: protectedCustomerProcedure.query(async ({ ctx }) => {
    const count = await ctx.db.notification.count({
      where: { userId: ctx.session.userId, read: false },
    });
    return { count };
  }),

  markAsRead: protectedCustomerProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.notification.update({
        where: { id: input.notificationId, userId: ctx.session.userId },
        data: { read: true },
      });
    }),

  markAllAsRead: protectedCustomerProcedure.mutation(async ({ ctx }) => {
    await ctx.db.notification.updateMany({
      where: { userId: ctx.session.userId, read: false },
      data: { read: true },
    });
    return { success: true };
  }),

  clearAll: protectedCustomerProcedure.mutation(async ({ ctx }) => {
    await ctx.db.notification.deleteMany({
      where: { userId: ctx.session.userId },
    });
    return { success: true };
  }),

  getPreferences: protectedCustomerProcedure.query(async ({ ctx }) => {
    const preference = await ctx.db.notificationPreference.findUnique({
      where: { userId: ctx.session.userId },
    });

    // Return defaults if no preference exists
    return (
      preference ?? {
        pushEnabled: true,
        emailEnabled: true,
        smsEnabled: false,
        notificationEmail: null,
        phoneNumber: null,
        expoPushToken: null,
      }
    );
  }),

  updatePreferences: protectedCustomerProcedure
    .input(
      z.object({
        pushEnabled: z.boolean().optional(),
        emailEnabled: z.boolean().optional(),
        smsEnabled: z.boolean().optional(),
        notificationEmail: z.string().email().nullable().optional(),
        phoneNumber: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.notificationPreference.upsert({
        where: { userId: ctx.session.userId },
        update: input,
        create: {
          userId: ctx.session.userId,
          pushEnabled: input.pushEnabled ?? true,
          emailEnabled: input.emailEnabled ?? true,
          smsEnabled: input.smsEnabled ?? false,
          notificationEmail: input.notificationEmail ?? null,
          phoneNumber: input.phoneNumber ?? null,
        },
      });
    }),

  registerPushToken: protectedCustomerProcedure
    .input(z.object({ expoPushToken: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.notificationPreference.upsert({
        where: { userId: ctx.session.userId },
        update: { expoPushToken: input.expoPushToken },
        create: {
          userId: ctx.session.userId,
          expoPushToken: input.expoPushToken,
        },
      });
    }),
});
