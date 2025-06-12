import { CommentType, LocationType, NoteType, UserType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { db } from "@ebox/db";

import { createTRPCRouter, protectedAdminProcedure } from "../trpc";

// Input schemas
const locationCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  email: z.string().email().optional(),
  storageCapacity: z.number().min(1, "Storage capacity must be at least 1"),
  locationType: z.nativeEnum(LocationType),
});

const locationUpdateSchema = z.object({
  locationId: z.number(),
  name: z.string().min(1, "Name is required").optional(),
  address: z.string().min(1, "Address is required").optional(),
  email: z.string().email().optional(),
  storageCapacity: z
    .number()
    .min(1, "Storage capacity must be at least 1")
    .optional(),
  locationType: z.nativeEnum(LocationType).optional(),
});

const hoursUpdateSchema = z.object({
  locationId: z.number(),
  hours: z.array(
    z.object({
      dayOfWeek: z.number().min(0).max(6),
      openTime: z.string().nullable(),
      closeTime: z.string().nullable(),
      isOpen: z.boolean(),
    }),
  ),
});

const locationCommentSchema = z.object({
  text: z.string().min(1, "Comment cannot be empty"),
  locationId: z.number(),
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

const locationNoteSchema = z.object({
  text: z.string().min(1, "Note cannot be empty"),
  locationId: z.number(),
});

// Helper function for role-based access control
const getUserLocationAccess = async (userId: string, locationId?: number) => {
  const userType = await db.user.findUnique({
    where: { id: userId },
    select: { userType: true },
  });

  if (userType?.userType === UserType.CORPORATE) {
    return { hasAccess: true, locationIds: "all" };
  } else if (userType?.userType === UserType.EMPLOYEE) {
    const employee = await db.employeeAccount.findUnique({
      where: { id: userId },
      select: { locationId: true },
    });

    if (!employee) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Employee account not found",
      });
    }

    if (locationId && employee.locationId !== locationId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Employee can only access their assigned location",
      });
    }

    return { hasAccess: true, locationIds: [employee.locationId] };
  }

  throw new TRPCError({ code: "UNAUTHORIZED" });
};

// Helper function to generate activity comments for changes
const generateActivityComment = async (
  userId: string,
  locationId: number,
  changes: Record<string, any>,
) => {
  for (const [field, newValue] of Object.entries(changes)) {
    let message = "";

    switch (field) {
      case "email":
        message = `Email updated to ${newValue}`;
        break;
      case "address":
        message = `Address updated to ${newValue}`;
        break;
      case "locationType":
        message = `Location type changed to ${newValue}`;
        break;
      case "storageCapacity":
        message = `Storage capacity updated to ${newValue}`;
        break;
      case "name":
        message = `Location name updated to ${newValue}`;
        break;
      default:
        continue;
    }

    await db.comment.create({
      data: {
        text: message,
        commentType: CommentType.LOCATION,
        authorId: userId,
        locationComment: {
          create: { locationId },
        },
      },
    });
  }
};

export const locationsRouter = createTRPCRouter({
  // List all locations with role-based filtering
  getAllLocations: protectedAdminProcedure.query(async ({ ctx }) => {
    const access = await getUserLocationAccess(ctx.session.userId);

    const whereClause =
      access.locationIds === "all"
        ? {}
        : { id: { in: access.locationIds as number[] } };

    return await ctx.db.location.findMany({
      where: whereClause,
      include: {
        hours: {
          orderBy: { dayOfWeek: "asc" },
        },
        employeeAccounts: {
          select: { id: true },
        },
        orders: {
          select: { id: true },
        },
      },
      orderBy: { name: "asc" },
    });
  }),

  // Get single location details
  getLocationDetails: protectedAdminProcedure
    .input(z.object({ locationId: z.number() }))
    .query(async ({ ctx, input }) => {
      await getUserLocationAccess(ctx.session.userId, input.locationId);

      const location = await ctx.db.location.findUnique({
        where: { id: input.locationId },
        include: {
          hours: {
            orderBy: { dayOfWeek: "asc" },
          },
          employeeAccounts: {
            select: {
              id: true,
              employeeRole: true,
            },
          },
          orders: {
            select: {
              id: true,
              vendorOrderId: true,
              deliveredDate: true,
              pickedUpAt: true,
            },
            take: 5,
            orderBy: { createdAt: "desc" },
          },
          locationComments: {
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
          locationNotes: {
            include: {
              note: true,
            },
            orderBy: {
              note: {
                createdAt: "desc",
              },
            },
          },
        },
      });

      if (!location) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Location not found",
        });
      }

      return location;
    }),

  // Create new location (Corporate only)
  createLocation: protectedAdminProcedure
    .input(locationCreateSchema)
    .mutation(async ({ ctx, input }) => {
      // Only corporate users can create locations
      const userType = await ctx.db.user.findUnique({
        where: { id: ctx.session.userId },
        select: { userType: true },
      });

      if (userType?.userType !== UserType.CORPORATE) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only corporate users can create locations",
        });
      }

      // Create location with default hours
      const location = await ctx.db.location.create({
        data: {
          name: input.name,
          address: input.address,
          email: input.email,
          storageCapacity: input.storageCapacity,
          locationType: input.locationType,
          hours: {
            create: [
              // Default hours: Monday-Friday 9 AM - 5 PM, weekends closed
              { dayOfWeek: 0, isOpen: false }, // Sunday
              {
                dayOfWeek: 1,
                openTime: "09:00",
                closeTime: "17:00",
                isOpen: true,
              }, // Monday
              {
                dayOfWeek: 2,
                openTime: "09:00",
                closeTime: "17:00",
                isOpen: true,
              }, // Tuesday
              {
                dayOfWeek: 3,
                openTime: "09:00",
                closeTime: "17:00",
                isOpen: true,
              }, // Wednesday
              {
                dayOfWeek: 4,
                openTime: "09:00",
                closeTime: "17:00",
                isOpen: true,
              }, // Thursday
              {
                dayOfWeek: 5,
                openTime: "09:00",
                closeTime: "17:00",
                isOpen: true,
              }, // Friday
              { dayOfWeek: 6, isOpen: false }, // Saturday
            ],
          },
        },
        include: {
          hours: {
            orderBy: { dayOfWeek: "asc" },
          },
        },
      });

      return location;
    }),

  // Update location details
  updateLocation: protectedAdminProcedure
    .input(locationUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      await getUserLocationAccess(ctx.session.userId, input.locationId);

      const { locationId, ...updateData } = input;

      // Get current location to compare changes
      const currentLocation = await ctx.db.location.findUnique({
        where: { id: locationId },
      });

      if (!currentLocation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Location not found",
        });
      }

      // Filter out undefined values and detect changes
      const changes: Record<string, any> = {};
      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined && value !== (currentLocation as any)[key]) {
          changes[key] = value;
        }
      });

      if (Object.keys(changes).length === 0) {
        return currentLocation;
      }

      // Update location
      const updatedLocation = await ctx.db.location.update({
        where: { id: locationId },
        data: changes,
      });

      // Generate activity comments for changes
      await generateActivityComment(ctx.session.userId, locationId, changes);

      return updatedLocation;
    }),

  // Update store hours
  updateLocationHours: protectedAdminProcedure
    .input(hoursUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      await getUserLocationAccess(ctx.session.userId, input.locationId);

      // Delete existing hours and create new ones
      await ctx.db.locationHours.deleteMany({
        where: { locationId: input.locationId },
      });

      await ctx.db.locationHours.createMany({
        data: input.hours.map((hour) => ({
          locationId: input.locationId,
          dayOfWeek: hour.dayOfWeek,
          openTime: hour.openTime,
          closeTime: hour.closeTime,
          isOpen: hour.isOpen,
        })),
      });

      // Generate activity comment
      await db.comment.create({
        data: {
          text: "Store hours updated",
          commentType: CommentType.LOCATION,
          authorId: ctx.session.userId,
          locationComment: {
            create: { locationId: input.locationId },
          },
        },
      });

      return { success: true };
    }),

  // Location comments
  locationComments: createTRPCRouter({
    create: protectedAdminProcedure
      .input(locationCommentSchema)
      .mutation(async ({ ctx, input }) => {
        await getUserLocationAccess(ctx.session.userId, input.locationId);

        await ctx.db.comment.create({
          data: {
            text: input.text,
            commentType: CommentType.LOCATION,
            filePaths: input.filePaths || [],
            authorId: ctx.session.userId,
            locationComment: {
              create: {
                locationId: input.locationId,
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
      .input(z.object({ locationId: z.number() }))
      .query(async ({ ctx, input }) => {
        await getUserLocationAccess(ctx.session.userId, input.locationId);

        return await ctx.db.locationComment.findMany({
          where: { locationId: input.locationId },
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
        });
      }),

    update: protectedAdminProcedure
      .input(
        z.object({
          commentId: z.string(),
          text: z.string(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        // First find the location comment to verify permissions
        const locationComment = await ctx.db.locationComment.findFirst({
          where: {
            comment: {
              id: input.commentId,
            },
          },
          include: {
            comment: true,
          },
        });

        if (!locationComment) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Comment not found",
          });
        }

        // Check location access
        await getUserLocationAccess(
          ctx.session.userId,
          locationComment.locationId,
        );

        // Check if user owns the comment or is corporate
        const userType = await ctx.db.user.findUnique({
          where: {
            id: ctx.session.userId,
          },
          select: {
            userType: true,
          },
        });

        if (
          userType?.userType === UserType.EMPLOYEE &&
          locationComment.comment.authorId !== ctx.session.userId
        ) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You can only edit your own comments",
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

        return { success: true };
      }),

    delete: protectedAdminProcedure
      .input(
        z.object({
          commentId: z.string(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        // First find the location comment to verify permissions
        const locationComment = await ctx.db.locationComment.findFirst({
          where: {
            comment: {
              id: input.commentId,
            },
          },
          include: {
            comment: true,
          },
        });

        if (!locationComment) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Comment not found",
          });
        }

        // Check location access
        await getUserLocationAccess(
          ctx.session.userId,
          locationComment.locationId,
        );

        // Check if user owns the comment or is corporate
        const userType = await ctx.db.user.findUnique({
          where: {
            id: ctx.session.userId,
          },
          select: {
            userType: true,
          },
        });

        if (
          userType?.userType === UserType.EMPLOYEE &&
          locationComment.comment.authorId !== ctx.session.userId
        ) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You can only delete your own comments",
          });
        }

        await ctx.db.comment.delete({
          where: {
            id: input.commentId,
          },
        });

        return { success: true };
      }),
  }),

  // Location notes
  locationNotes: createTRPCRouter({
    create: protectedAdminProcedure
      .input(locationNoteSchema)
      .mutation(async ({ ctx, input }) => {
        await getUserLocationAccess(ctx.session.userId, input.locationId);

        await ctx.db.note.create({
          data: {
            text: input.text,
            noteType: NoteType.LOCATION,
            createdAt: new Date(),
            updatedAt: new Date(),
            locationNote: {
              create: {
                locationId: input.locationId,
              },
            },
          },
        });

        return { success: true };
      }),

    query: protectedAdminProcedure
      .input(z.object({ locationId: z.number() }))
      .query(async ({ ctx, input }) => {
        await getUserLocationAccess(ctx.session.userId, input.locationId);

        return await ctx.db.locationNote.findMany({
          where: { locationId: input.locationId },
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

    update: protectedAdminProcedure
      .input(
        z.object({
          noteId: z.string(),
          text: z.string().min(1, "Note cannot be empty"),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        // First find the location note to verify permissions
        const locationNote = await ctx.db.locationNote.findFirst({
          where: {
            note: {
              id: input.noteId,
            },
          },
          include: {
            note: true,
          },
        });

        if (!locationNote) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Note not found",
          });
        }

        // Check location access
        await getUserLocationAccess(
          ctx.session.userId,
          locationNote.locationId,
        );

        await ctx.db.note.update({
          where: {
            id: input.noteId,
          },
          data: {
            text: input.text,
            updatedAt: new Date(),
          },
        });

        return { success: true };
      }),

    delete: protectedAdminProcedure
      .input(
        z.object({
          noteId: z.string(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        // First find the location note to verify permissions
        const locationNote = await ctx.db.locationNote.findFirst({
          where: {
            note: {
              id: input.noteId,
            },
          },
          include: {
            note: true,
          },
        });

        if (!locationNote) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Note not found",
          });
        }

        // Check location access
        await getUserLocationAccess(
          ctx.session.userId,
          locationNote.locationId,
        );

        await ctx.db.note.delete({
          where: {
            id: input.noteId,
          },
        });

        return { success: true };
      }),
  }),

  // Edit location details
  editLocation: protectedAdminProcedure
    .input(locationUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      await getUserLocationAccess(ctx.session.userId, input.locationId);

      const { locationId, ...updateData } = input;

      // Get current location to compare changes
      const currentLocation = await ctx.db.location.findUnique({
        where: { id: locationId },
      });

      if (!currentLocation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Location not found",
        });
      }

      // Only corporate users can edit location details for now
      const userType = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.userId,
        },
        select: {
          userType: true,
        },
      });

      if (userType?.userType !== UserType.CORPORATE) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only corporate users can edit location details",
        });
      }

      // Filter out undefined values and detect changes
      const changes: Record<string, any> = {};
      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined && value !== (currentLocation as any)[key]) {
          changes[key] = value;
        }
      });

      if (Object.keys(changes).length === 0) {
        return currentLocation;
      }

      // Update location
      const updatedLocation = await ctx.db.location.update({
        where: { id: locationId },
        data: changes,
      });

      // Generate activity comments for changes
      await generateActivityComment(ctx.session.userId, locationId, changes);

      return updatedLocation;
    }),

  // TODO: this works differently than order comments. Doesn't use Clerk.
  getLocationEmployees: protectedAdminProcedure
    .input(z.object({ locationId: z.number() }))
    .query(async ({ ctx, input }) => {
      await getUserLocationAccess(ctx.session.userId, input.locationId);

      return await ctx.db.employeeAccount.findMany({
        where: {
          locationId: input.locationId,
        },
        select: {
          id: true,
        },
      });
    }),
});
