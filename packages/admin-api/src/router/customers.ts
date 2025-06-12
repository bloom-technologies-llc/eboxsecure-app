import { CommentType, NoteType, UserType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedAdminProcedure } from "../trpc";

// Input schemas
const customerCommentSchema = z.object({
  text: z.string().min(1, "Comment cannot be empty"),
  customerId: z.string(),
  filePaths: z.array(z.string()).optional(),
  notifications: z
    .array(
      z.object({
        userId: z.string(),
        message: z.string(),
      }),
    )
    .optional(),
});

const customerNoteSchema = z.object({
  text: z.string().min(1, "Note cannot be empty"),
  customerId: z.string(),
});

const orderHistorySchema = z.object({
  customerId: z.string(),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(20),
});

const paginationSchema = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(20),
});

export const customersRouter = createTRPCRouter({
  // List all customers with order counts (with pagination)
  getAllCustomers: protectedAdminProcedure
    .input(paginationSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.userId;
      const userType = await ctx.db.user.findUnique({
        where: { id: userId },
        select: { userType: true },
      });

      if (!userType) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not found",
        });
      }

      const skip = (input.page - 1) * input.limit;

      if (userType.userType === UserType.CORPORATE) {
        // Corporate users can see all customers
        const [customers, totalCount] = await Promise.all([
          ctx.db.customerAccount.findMany({
            include: {
              orders: {
                select: { id: true },
              },
              user: {
                select: { createdAt: true },
              },
            },
            orderBy: { user: { createdAt: "desc" } },
            skip,
            take: input.limit,
          }),
          ctx.db.customerAccount.count(),
        ]);

        const totalPages = Math.ceil(totalCount / input.limit);
        const hasNextPage = input.page < totalPages;

        return {
          customers,
          pagination: {
            page: input.page,
            limit: input.limit,
            totalCount,
            totalPages,
            hasNextPage,
          },
        };
      } else if (userType.userType === UserType.EMPLOYEE) {
        // Employee users can only see customers who have orders at their locations
        const employee = await ctx.db.employeeAccount.findUnique({
          where: { id: ctx.session.userId },
          select: { locationId: true },
        });

        if (!employee) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Employee not found",
          });
        }

        const whereClause = {
          orders: {
            some: {
              shippedLocationId: employee.locationId,
            },
          },
        };

        const [customers, totalCount] = await Promise.all([
          ctx.db.customerAccount.findMany({
            where: whereClause,
            include: {
              orders: {
                where: {
                  shippedLocationId: employee.locationId,
                },
                select: { id: true },
              },
              user: {
                select: { createdAt: true },
              },
            },
            orderBy: { user: { createdAt: "desc" } },
            skip,
            take: input.limit,
          }),
          ctx.db.customerAccount.count({ where: whereClause }),
        ]);

        const totalPages = Math.ceil(totalCount / input.limit);
        const hasNextPage = input.page < totalPages;

        return {
          customers,
          pagination: {
            page: input.page,
            limit: input.limit,
            totalCount,
            totalPages,
            hasNextPage,
          },
        };
      } else {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid user type",
        });
      }
    }),

  // Get detailed customer information
  getCustomerDetails: protectedAdminProcedure
    .input(z.object({ customerId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.userId;
      const userType = await ctx.db.user.findUnique({
        where: { id: userId },
        select: { userType: true },
      });

      if (!userType) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not found",
        });
      }

      let whereClause: any = { id: input.customerId };

      if (userType.userType === UserType.EMPLOYEE) {
        // Employee users can only access customers who have orders at their locations
        const employee = await ctx.db.employeeAccount.findUnique({
          where: { id: ctx.session.userId },
          select: { locationId: true },
        });

        if (!employee) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Employee not found",
          });
        }

        whereClause = {
          id: input.customerId,
          orders: {
            some: {
              shippedLocationId: employee.locationId,
            },
          },
        };
      }

      const customer = await ctx.db.customerAccount.findFirst({
        where: whereClause,
        include: {
          user: {
            select: {
              createdAt: true,
              updatedAt: true,
            },
          },
          orders: {
            include: {
              shippedLocation: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 5,
          },
          customerComments: {
            include: {
              comment: {
                include: {
                  author: {
                    select: {
                      id: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              comment: {
                createdAt: "desc",
              },
            },
          },
          customerNotes: {
            include: {
              note: true,
            },
            orderBy: {
              note: {
                createdAt: "desc",
              },
            },
          },
          trustedContactsGranted: {
            include: {
              trustedContact: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
            where: { status: "ACTIVE" },
          },
          trustedContactsReceived: {
            include: {
              accountHolder: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
            where: { status: "ACTIVE" },
          },
        },
      });

      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer not found or access denied",
        });
      }

      // Get favorite locations
      const favoriteLocations = await ctx.db.userFavoriteLocation.findMany({
        where: { userId: input.customerId },
        include: {
          location: {
            select: {
              id: true,
              name: true,
              address: true,
              locationType: true,
            },
          },
        },
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
      });

      // Get total order count
      let totalOrderCount = 0;
      if (userType.userType === UserType.CORPORATE) {
        totalOrderCount = await ctx.db.order.count({
          where: { customerId: input.customerId },
        });
      } else if (userType.userType === UserType.EMPLOYEE) {
        const employee = await ctx.db.employeeAccount.findUnique({
          where: { id: ctx.session.userId },
          select: { locationId: true },
        });

        if (employee) {
          totalOrderCount = await ctx.db.order.count({
            where: {
              customerId: input.customerId,
              shippedLocationId: employee.locationId,
            },
          });
        }
      }

      return {
        ...customer,
        favoriteLocations,
        totalOrderCount,
      };
    }),

  // Get paginated order history for a customer
  getCustomerOrderHistory: protectedAdminProcedure
    .input(orderHistorySchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.userId;
      const userType = await ctx.db.user.findUnique({
        where: { id: userId },
        select: { userType: true },
      });

      if (!userType) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not found",
        });
      }

      let whereClause: any = { customerId: input.customerId };

      if (userType.userType === UserType.EMPLOYEE) {
        const employee = await ctx.db.employeeAccount.findUnique({
          where: { id: ctx.session.userId },
          select: { locationId: true },
        });

        if (!employee) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Employee not found",
          });
        }

        whereClause = {
          customerId: input.customerId,
          shippedLocationId: employee.locationId,
        };
      }

      const skip = (input.page - 1) * input.limit;

      const [orders, totalCount] = await Promise.all([
        ctx.db.order.findMany({
          where: whereClause,
          include: {
            shippedLocation: {
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: input.limit,
        }),
        ctx.db.order.count({ where: whereClause }),
      ]);

      const totalPages = Math.ceil(totalCount / input.limit);
      const hasNextPage = input.page < totalPages;

      return {
        orders,
        pagination: {
          page: input.page,
          limit: input.limit,
          totalCount,
          totalPages,
          hasNextPage,
        },
      };
    }),

  // Customer Comments Router
  customerComments: createTRPCRouter({
    create: protectedAdminProcedure
      .input(customerCommentSchema)
      .mutation(async ({ ctx, input }) => {
        // Verify access to customer
        const hasAccess = await verifyCustomerAccess(ctx, input.customerId);
        if (!hasAccess) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Access denied to this customer",
          });
        }

        await ctx.db.comment.create({
          data: {
            text: input.text,
            commentType: CommentType.CUSTOMER,
            filePaths: input.filePaths || [],
            authorId: ctx.session.userId,
            customerComment: {
              create: {
                customerAccountId: input.customerId,
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

        return { success: true };
      }),

    query: protectedAdminProcedure
      .input(z.object({ customerId: z.string() }))
      .query(async ({ ctx, input }) => {
        // Verify access to customer
        const hasAccess = await verifyCustomerAccess(ctx, input.customerId);
        if (!hasAccess) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Access denied to this customer",
          });
        }

        return await ctx.db.customerComment.findMany({
          where: { customerAccountId: input.customerId },
          include: {
            comment: {
              include: {
                author: {
                  select: {
                    id: true,
                  },
                },
                notifications: true,
              },
            },
          },
          orderBy: {
            comment: {
              createdAt: "desc",
            },
          },
        });
      }),

    update: protectedAdminProcedure
      .input(
        z.object({
          commentId: z.string(),
          text: z.string().min(1, "Comment cannot be empty"),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        // Verify the comment exists and user has access
        const comment = await ctx.db.comment.findUnique({
          where: { id: input.commentId },
          include: {
            customerComment: {
              include: {
                customer: true,
              },
            },
          },
        });

        if (!comment?.customerComment) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Comment not found",
          });
        }

        const hasAccess = await verifyCustomerAccess(
          ctx,
          comment.customerComment.customerAccountId,
        );
        if (!hasAccess) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Access denied to this customer",
          });
        }

        await ctx.db.comment.update({
          where: { id: input.commentId },
          data: { text: input.text },
        });

        return { success: true };
      }),

    remove: protectedAdminProcedure
      .input(z.object({ commentId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        // Verify the comment exists and user has access
        const comment = await ctx.db.comment.findUnique({
          where: { id: input.commentId },
          include: {
            customerComment: {
              include: {
                customer: true,
              },
            },
          },
        });

        if (!comment?.customerComment) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Comment not found",
          });
        }

        const hasAccess = await verifyCustomerAccess(
          ctx,
          comment.customerComment.customerAccountId,
        );
        if (!hasAccess) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Access denied to this customer",
          });
        }

        await ctx.db.comment.delete({
          where: { id: input.commentId },
        });

        return { success: true };
      }),
  }),

  // Customer Notes Router
  customerNotes: createTRPCRouter({
    create: protectedAdminProcedure
      .input(customerNoteSchema)
      .mutation(async ({ ctx, input }) => {
        // Verify access to customer
        const hasAccess = await verifyCustomerAccess(ctx, input.customerId);
        if (!hasAccess) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Access denied to this customer",
          });
        }

        await ctx.db.note.create({
          data: {
            text: input.text,
            noteType: NoteType.CUSTOMER,
            createdAt: new Date(),
            updatedAt: new Date(),
            customerNote: {
              create: {
                customerId: input.customerId,
              },
            },
          },
        });

        return { success: true };
      }),

    query: protectedAdminProcedure
      .input(z.object({ customerId: z.string() }))
      .query(async ({ ctx, input }) => {
        // Verify access to customer
        const hasAccess = await verifyCustomerAccess(ctx, input.customerId);
        if (!hasAccess) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Access denied to this customer",
          });
        }

        return await ctx.db.customerNote.findMany({
          where: { customerId: input.customerId },
          include: {
            note: true,
          },
          orderBy: {
            note: {
              createdAt: "desc",
            },
          },
        });
      }),
  }),
});

// Helper function to verify customer access based on user type
async function verifyCustomerAccess(
  ctx: any,
  customerId: string,
): Promise<boolean> {
  const userType = await ctx.db.user.findUnique({
    where: { id: ctx.session.userId },
    select: { userType: true },
  });

  if (!userType) {
    return false;
  }

  if (userType.userType === UserType.CORPORATE) {
    // Corporate users can access all customers
    const customer = await ctx.db.customerAccount.findUnique({
      where: { id: customerId },
    });
    return !!customer;
  } else if (userType.userType === UserType.EMPLOYEE) {
    // Employee users can only access customers who have orders at their locations
    const employee = await ctx.db.employeeAccount.findUnique({
      where: { id: ctx.session.userId },
      select: { locationId: true },
    });

    if (!employee) {
      return false;
    }

    const customer = await ctx.db.customerAccount.findFirst({
      where: {
        id: customerId,
        orders: {
          some: {
            shippedLocationId: employee.locationId,
          },
        },
      },
    });

    return !!customer;
  }

  return false;
}
