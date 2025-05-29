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
});
