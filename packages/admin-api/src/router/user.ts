import { clerkClient } from "@clerk/nextjs/server";
import { UserType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedAdminProcedure,
  protectedProcedure,
} from "../trpc";

export const userRouter = createTRPCRouter({
  // Resolves admin-portal user IDs (comment authors) to display names. Staff
  // names live in Clerk, not in the database.
  getDisplayNames: protectedAdminProcedure
    .input(z.object({ ids: z.array(z.string().min(1)).min(1).max(100) }))
    .query(async ({ input }) => {
      const ids = [...new Set(input.ids)];
      const clerk = await clerkClient();
      const { data: users } = await clerk.users.getUserList({
        userId: ids,
        limit: ids.length,
      });

      const names: Record<string, string> = {};
      for (const user of users) {
        const fullName = [user.firstName, user.lastName]
          .filter(Boolean)
          .join(" ")
          .trim();
        const email = user.emailAddresses.find(
          (address) => address.id === user.primaryEmailAddressId,
        )?.emailAddress;
        names[user.id] = fullName || email || "Unknown user";
      }
      return names;
    }),

  getUserType: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.userId,
        },
        select: {
          userType: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not found",
        });
      }

      return user.userType;
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get user type",
      });
    }
  }),

  getCurrentUserDetails: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.userId,
        },
        select: {
          userType: true,
          employeeAccount: {
            select: {
              employeeRole: true,
              locationId: true,
              location: {
                select: {
                  name: true,
                  city: true,
                  address: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not found",
        });
      }

      if (user.userType === UserType.EMPLOYEE && user.employeeAccount) {
        return {
          userType: user.userType,
          employeeRole: user.employeeAccount.employeeRole,
          locationId: user.employeeAccount.locationId,
          locationName: user.employeeAccount.location.name,
          locationCity: user.employeeAccount.location.city,
          locationAddress: user.employeeAccount.location.address,
        };
      }

      return {
        userType: user.userType,
        employeeRole: null,
        locationId: null,
        locationName: null,
        locationCity: null,
        locationAddress: null,
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get user details",
      });
    }
  }),
});
