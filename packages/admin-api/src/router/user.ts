import { clerkClient } from "@clerk/nextjs/server";
import { EmployeeRole } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedEmployeeProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
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
