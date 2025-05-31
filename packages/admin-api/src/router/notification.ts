import { z } from "zod";

import { createTRPCRouter, protectedAdminProcedure } from "../trpc";

export const notification = createTRPCRouter({
  getNotifications: protectedAdminProcedure.query(async ({ ctx }) => {
    const notifications = await ctx.db.notification.findMany({
      where: {
        userId: ctx.session.userId,
      },
      include: {
        comment: {
          select: {
            id: true,
            commentType: true,
            orderComment: {
              select: {
                order: true,
              },
            },
          },
        },
      },
    });
    return notifications;
  }),

  markAsRead: protectedAdminProcedure
    .input(
      z.object({
        notificationId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const notification = await ctx.db.notification.update({
        where: {
          id: input.notificationId,
          userId: ctx.session.userId,
        },
        data: {
          read: true,
        },
      });
      return notification;
    }),

  clearAllNotifications: protectedAdminProcedure.mutation(async ({ ctx }) => {
    await ctx.db.notification.deleteMany({
      where: {
        userId: ctx.session.userId,
      },
    });
    return { success: true };
  }),
});
