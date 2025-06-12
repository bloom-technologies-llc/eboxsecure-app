import { clerkClient } from "@clerk/nextjs/server";
import { CommentType, UserType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedAdminProcedure } from "../trpc";

export const orderComments = createTRPCRouter({
  createOrderComment: protectedAdminProcedure
    .input(
      z.object({
        text: z.string(),
        filePaths: z.array(z.string()).optional(),
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
      const userType = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.userId,
        },
        select: {
          userType: true,
        },
      });
      if (userType?.userType === UserType.EMPLOYEE) {
        const user = await ctx.db.employeeAccount.findUnique({
          where: {
            id: ctx.session.userId,
          },
          select: {
            locationId: true,
          },
        });
        if (!user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not found",
          });
        }

        const order = await ctx.db.order.findUnique({
          where: {
            id: input.orderId,
            shippedLocationId: user.locationId,
          },
        });
        if (!order) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User is unauthorized to access this order",
          });
        }
        await ctx.db.comment.create({
          data: {
            text: input.text,
            commentType: CommentType.ORDER,
            filePaths: input.filePaths || [],
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
      } else if (userType?.userType === UserType.CORPORATE) {
        await ctx.db.comment.create({
          data: {
            text: input.text,
            commentType: CommentType.ORDER,
            filePaths: input.filePaths || [],
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
      }
    }),

  updateOrderComments: protectedAdminProcedure
    .input(
      z.object({
        commentId: z.string(),
        text: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userType = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.userId,
        },
        select: {
          userType: true,
        },
      });

      if (userType?.userType === UserType.EMPLOYEE) {
        const user = await ctx.db.employeeAccount.findUnique({
          where: {
            id: ctx.session.userId,
          },
          select: {
            locationId: true,
          },
        });
        if (!user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not found",
          });
        }

        // Verify the comment's order belongs to the employee's location
        const comment = await ctx.db.comment.findUnique({
          where: {
            id: input.commentId,
            orderComment: {
              order: {
                shippedLocationId: user.locationId,
              },
            },
          },
          include: {
            orderComment: {
              include: {
                order: true,
              },
            },
          },
        });
        if (!comment) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User is unauthorized to access this comment",
          });
        }
        await ctx.db.comment.update({
          where: {
            id: input.commentId,
          },
          data: {
            text: input.text,
          },
        });
      } else if (userType?.userType === UserType.CORPORATE) {
        await ctx.db.comment.update({
          where: {
            id: input.commentId,
          },
          data: {
            text: input.text,
          },
        });
      }
    }),

  queryOrderComments: protectedAdminProcedure
    .input(
      z.object({
        orderId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userType = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.userId,
        },
        select: {
          userType: true,
        },
      });

      if (userType?.userType === UserType.CORPORATE) {
        return await ctx.db.orderComment.findMany({
          where: {
            orderId: input.orderId,
          },
          include: {
            comment: true,
          },
        });
      } else if (userType?.userType === UserType.EMPLOYEE) {
        const user = await ctx.db.employeeAccount.findUnique({
          where: {
            id: ctx.session.userId,
          },
          select: {
            locationId: true,
          },
        });
        if (!user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not found",
          });
        }
        const orderComments = await ctx.db.orderComment.findMany({
          where: {
            orderId: input.orderId,
            order: {
              shippedLocationId: user.locationId,
            },
          },
          include: {
            comment: true,
          },
        });
        if (!orderComments) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User is unauthorized to access this order",
          });
        }
        return orderComments;
      }
    }),

  removeOrderComments: protectedAdminProcedure
    .input(
      z.object({
        commentId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userType = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.userId,
        },
        select: {
          userType: true,
        },
      });

      if (userType?.userType === UserType.EMPLOYEE) {
        const user = await ctx.db.employeeAccount.findUnique({
          where: {
            id: ctx.session.userId,
          },
          select: {
            locationId: true,
          },
        });
        if (!user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not found",
          });
        }

        const comment = await ctx.db.comment.findUnique({
          where: {
            id: input.commentId,
            orderComment: {
              order: {
                shippedLocationId: user.locationId,
              },
            },
          },
          include: {
            orderComment: {
              include: {
                order: true,
              },
            },
          },
        });
        if (!comment) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User is unauthorized to access this comment",
          });
        }
        await ctx.db.comment.delete({
          where: {
            id: input.commentId,
          },
        });
      } else if (userType?.userType === UserType.CORPORATE) {
        await ctx.db.comment.delete({
          where: {
            id: input.commentId,
          },
        });
      }
    }),

  getLocationEmployees: protectedAdminProcedure
    .input(
      z.object({
        locationId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const clerk = await clerkClient();

      const userType = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.userId,
        },
        select: {
          userType: true,
        },
      });

      let locationId: number;

      if (userType?.userType === UserType.EMPLOYEE) {
        const user = await ctx.db.employeeAccount.findUnique({
          where: {
            id: ctx.session.userId,
          },
          select: {
            locationId: true,
          },
        });
        if (!user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not found",
          });
        }
        locationId = user.locationId;
      } else if (userType?.userType === UserType.CORPORATE) {
        locationId = input.locationId;
      } else {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User is unauthorized to access this location",
        });
      }

      const eligibleEmployees = await ctx.db.employeeAccount.findMany({
        where: {
          locationId,
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
