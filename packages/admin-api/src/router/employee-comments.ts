import { CommentType, UserType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedAdminProcedure } from "../trpc";

// Helper function to verify employee comment access
const verifyEmployeeCommentAccess = async (
  userId: string,
  employeeId: string,
  db: any,
) => {
  const userType = await db.user.findUnique({
    where: { id: userId },
    select: { userType: true },
  });

  if (userType?.userType === UserType.CORPORATE) {
    return true; // Corporate has access to all employee comments
  }

  if (userType?.userType === UserType.EMPLOYEE) {
    const user = await db.employeeAccount.findUnique({
      where: { id: userId },
      select: { locationId: true, employeeRole: true },
    });

    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Employee account not found",
      });
    }

    // Only managers can access employee comments
    if (user.employeeRole !== "MANAGER") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Only managers can access employee comments",
      });
    }

    // Check if target employee is in the same location
    const targetEmployee = await db.employeeAccount.findUnique({
      where: { id: employeeId },
      select: { locationId: true },
    });

    if (!targetEmployee) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Employee not found",
      });
    }

    if (targetEmployee.locationId !== user.locationId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Access denied to this employee's comments",
      });
    }

    return true;
  }

  throw new TRPCError({ code: "UNAUTHORIZED" });
};

export const employeeCommentsRouter = createTRPCRouter({
  create: protectedAdminProcedure
    .input(
      z.object({
        employeeId: z.string(),
        text: z.string().min(1),
        filePaths: z.array(z.string()).optional().default([]),
        notifications: z
          .array(
            z.object({
              userId: z.string(),
              message: z.string(),
            }),
          )
          .optional()
          .default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify access to this employee
      await verifyEmployeeCommentAccess(
        ctx.session.userId,
        input.employeeId,
        ctx.db,
      );

      // Create the comment
      const comment = await ctx.db.comment.create({
        data: {
          text: input.text,
          authorId: ctx.session.userId,
          commentType: CommentType.EMPLOYEE,
          filePaths: input.filePaths,
          employeeComment: {
            create: {
              employeeAccountId: input.employeeId,
            },
          },
          notifications: {
            create: input.notifications.map((notification) => ({
              userId: notification.userId,
              message: notification.message,
            })),
          },
        },
        include: {
          author: true,
          employeeComment: true,
        },
      });

      return comment;
    }),

  query: protectedAdminProcedure
    .input(z.object({ employeeId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify access to this employee
      await verifyEmployeeCommentAccess(
        ctx.session.userId,
        input.employeeId,
        ctx.db,
      );

      const employeeComments = await ctx.db.employeeComment.findMany({
        where: {
          employeeAccountId: input.employeeId,
        },
        include: {
          comment: {
            include: {
              author: true,
            },
          },
        },
        orderBy: {
          comment: {
            createdAt: "desc",
          },
        },
      });

      return employeeComments;
    }),

  update: protectedAdminProcedure
    .input(
      z.object({
        commentId: z.string(),
        text: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userType = await ctx.db.user.findUnique({
        where: { id: ctx.session.userId },
        select: { userType: true },
      });

      if (userType?.userType === UserType.EMPLOYEE) {
        // For employees, verify they own the comment and have access to the employee
        const comment = await ctx.db.comment.findUnique({
          where: {
            id: input.commentId,
            authorId: ctx.session.userId, // Must be comment author
            employeeComment: {
              employee: {
                location: {
                  employeeAccounts: {
                    some: {
                      id: ctx.session.userId,
                      employeeRole: "MANAGER", // Must be manager
                    },
                  },
                },
              },
            },
          },
          include: {
            employeeComment: {
              include: {
                employee: true,
              },
            },
          },
        });

        if (!comment) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Comment not found or access denied",
          });
        }

        await ctx.db.comment.update({
          where: { id: input.commentId },
          data: { text: input.text },
        });
      } else if (userType?.userType === UserType.CORPORATE) {
        // Corporate can edit any employee comment
        await ctx.db.comment.update({
          where: { id: input.commentId },
          data: { text: input.text },
        });
      } else {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return { success: true };
    }),

  delete: protectedAdminProcedure
    .input(z.object({ commentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // First find the employee comment to verify permissions
      const employeeComment = await ctx.db.employeeComment.findFirst({
        where: {
          comment: {
            id: input.commentId,
          },
        },
        include: {
          comment: true,
          employee: true,
        },
      });

      if (!employeeComment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }

      // Verify access to this employee
      await verifyEmployeeCommentAccess(
        ctx.session.userId,
        employeeComment.employee.id,
        ctx.db,
      );

      // Check if user owns the comment or is corporate
      const userType = await ctx.db.user.findUnique({
        where: { id: ctx.session.userId },
        select: { userType: true },
      });

      if (
        userType?.userType === UserType.EMPLOYEE &&
        employeeComment.comment.authorId !== ctx.session.userId
      ) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You can only delete your own comments",
        });
      }

      await ctx.db.comment.delete({
        where: { id: input.commentId },
      });

      return { success: true };
    }),
});
