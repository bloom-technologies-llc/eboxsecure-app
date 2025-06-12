import { UserType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedAdminProcedure } from "../trpc";

export const notification = createTRPCRouter({
  getNotifications: protectedAdminProcedure.query(async ({ ctx }) => {
    const userType = await ctx.db.user.findUnique({
      where: {
        id: ctx.session.userId,
      },
      select: {
        userType: true,
      },
    });

    if (
      userType?.userType === UserType.CORPORATE ||
      userType?.userType === UserType.EMPLOYEE
    ) {
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
              locationComment: {
                select: {
                  locationId: true,
                  location: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      return notifications;
    } else {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User is unauthorized to access this notification",
      });
    }
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
