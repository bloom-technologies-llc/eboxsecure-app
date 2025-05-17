import { CommentType } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, protectedAdminProcedure } from "../trpc";

export const orderComments = createTRPCRouter({
  createOrderComment: protectedAdminProcedure
    .input(
      z.object({
        text: z.string(),
        commentType: z.nativeEnum(CommentType),
        imagePaths: z.array(z.string()).optional(),
        authorId: z.string(),
        orderId: z.number(),
        notifications: z
          .object({
            userId: z.string(),
            message: z.string(),
            commentId: z.string().optional(),
          })
          .array()
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.comment.create({
        data: {
          text: input.text,
          commentType: input.commentType,
          imagePaths: input.imagePaths,
          authorId: input.authorId,
          orderComment: {
            create: {
              orderId: input.orderId,
            },
          },
          notifications: {
            create: input.notifications?.map((notification) => ({
              userId: notification.userId,
              message: notification.message,
              commentId: notification.commentId,
            })),
          },
        },
      });
    }),

  queryOrderComments: protectedAdminProcedure
    .input(
      z.object({
        orderId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.orderComment.findMany({
        where: {
          orderId: input.orderId,
        },
        include: {
          comment: true,
        },
      });
    }),

  removeOrderComments: protectedAdminProcedure
    .input(
      z.object({
        commentId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.comment.delete({
        where: {
          id: input.commentId,
        },
      });
    }),
});
