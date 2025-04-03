import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedEboxProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  createUserAndSyncWithDatabase: protectedEboxProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
        emailAddress: z.array(z.string()),
        locationId: z.number(),
        employeeRole: z.enum(["MANAGER", "ASSOCIATE"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const client = await clerkClient();

        const clerkUser = await client.users.createUser({
          emailAddress: input.emailAddress,
        });

        const employeeUser = await ctx.db.user.create({
          data: {
            id: input.username, // Using username as the ID
            userType: "EMPLOYEE",
            employeeAccount: {
              create: {
                locationId: input.locationId,
                employeeRole: input.employeeRole,
              },
            },
          },
          include: {
            employeeAccount: true,
          },
        });

        return user;
      } catch (error) {
        console.error("Error creating user:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user",
        });
      }
    }),
});
