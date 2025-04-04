import { clerkClient } from "@clerk/nextjs/server";
import { EmployeeRole } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedEmployeeProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  createUserAndSyncWithDatabase: protectedEmployeeProcedure // going with protectedEmployeeProcedure instead of Ebox for separation of concerns
    .input(
      z.object({
        emailAddress: z.string().email(),
        password: z
          .string()
          .min(8, { message: "Must have at least 8 characters" }),
        // locationId: z.number(), //TODO: REPLACE AFTER IMPLEMENTING LOCATIONS
        employeeRole: z.enum([EmployeeRole.MANAGER, EmployeeRole.ASSOCIATE]),
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
