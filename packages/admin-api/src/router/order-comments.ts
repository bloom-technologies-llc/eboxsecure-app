import { clerkClient } from "@clerk/nextjs/server";
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
            })),
          },
        },
      });
    }),

  updateOrderComments: protectedAdminProcedure
    .input(
      z.object({
        commentId: z.string(),
        text: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.comment.update({
        where: {
          id: input.commentId,
        },
        data: {
          text: input.text,
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

  getLocationEmployees: protectedAdminProcedure
    .input(
      z.object({
        locationId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const clerk = await clerkClient();
      const eligibleEmployees = await ctx.db.employeeAccount.findMany({
        where: {
          locationId: input.locationId,
        },
        select: {
          id: true,
        },
      });

      const userIds = eligibleEmployees.map((employee) => employee.id);

      const clerkUserDetails = await clerk.users.getUserList({
        userId: userIds,
      });

      return eligibleEmployees.map((employee) => {
        const clerkUserDetail = clerkUserDetails.data.find(
          (user) => user.id === employee.id,
        );
        return {
          id: employee.id,
          firstName: clerkUserDetail?.firstName ?? "",
          lastName: clerkUserDetail?.lastName ?? "",
          email: clerkUserDetail?.emailAddresses[0]?.emailAddress ?? "",
        };
      });
    }),
});
