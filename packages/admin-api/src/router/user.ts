import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedEboxProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  createUserAndSyncWithDatabase: protectedEboxProcedure
    .input(
      z.object({
        emailAddress: z.string().email(),
        password: z.string(),
        // locationId: z.number(),
        employeeRole: z.enum(["MANAGER", "ASSOCIATE"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const client = await clerkClient();

        // const clerkUser = await client.users.createUser({
        //   emailAddress: input.emailAddress,
        // });

        const employeeUser = await ctx.db.user.create({
          data: {
            id: "1",
            userType: "EMPLOYEE",
            employeeAccount: {
              create: {
                locationId: 1,
                employeeRole: input.employeeRole,
              },
            },
          },
          include: {
            employeeAccount: true,
          },
        });

        return employeeUser;
      } catch (error) {
        console.error("Error creating user:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user",
        });
      }
    }),
});
