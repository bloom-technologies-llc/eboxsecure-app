import { clerkClient } from "@clerk/nextjs/server";
import { EmployeeRole, UserType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedEmployeeProcedure,
  protectedProcedure,
} from "../trpc";

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
        };
      }

      return {
        userType: user.userType,
        employeeRole: null,
        locationId: null,
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

  createEmployee: protectedEmployeeProcedure
    .input(
      z.object({
        emailAddress: z.string().email(),
        password: z.string(),
        // locationId: z.number(), //TODO: REPLACE AFTER IMPLEMENTING LOCATIONS
        employeeRole: z.nativeEnum(EmployeeRole),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const client = await clerkClient();

        // first create clerk user
        const clerkUser = await client.users.createUser({
          emailAddress: [input.emailAddress],
          password: input.password,
          skipPasswordChecks: true, // TODO: After user signs in, urge them to create stronger password.
        });

        // next, sync it to our backend
        await ctx.db.user.create({
          data: {
            id: clerkUser.id,
            userType: "EMPLOYEE",
            employeeAccount: {
              create: {
                locationId: 1, // TODO: REPLACE WITH ACTUAL LOCATION ID WHEN LOCATION IS IMPLEMENTED
                employeeRole: input.employeeRole,
              },
            },
          },
        });
      } catch (error) {
        console.error("Error creating user:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user",
        });
      }
    }),
});
