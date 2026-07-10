import { UserType } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
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
