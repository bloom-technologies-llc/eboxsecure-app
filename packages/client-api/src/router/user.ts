import { randomBytes } from "crypto";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { emailService } from "../services/emailService";
import { createTRPCRouter, protectedCustomerProcedure } from "../trpc";

// Letters (any script), spaces, hyphens, apostrophes and periods; must start
// with a letter. The name is matched against shipping labels at scan time, so
// it must be a real, non-blank name.
const nameSchema = z
  .string()
  .trim()
  .min(1, "Required")
  .max(50, "Must be 50 characters or fewer")
  .regex(
    /^\p{L}[\p{L}\p{M} .'’-]*$/u,
    "Only letters, spaces, hyphens, apostrophes and periods are allowed",
  );

export const userRouter = createTRPCRouter({
  createVirtualAddress: protectedCustomerProcedure.mutation(async ({ ctx }) => {
    let uniqueVirtualAddress = `CUST-${randomBytes(3).toString("hex").toUpperCase()}`;
    let isUnique = false;
    while (!isUnique) {
      const existingVirtualAddress = await ctx.db.customerAccount.findUnique({
        where: { virtualAddress: uniqueVirtualAddress },
      });
      if (!existingVirtualAddress) {
        isUnique = true;
      } else {
        uniqueVirtualAddress = `CUST-${randomBytes(3).toString("hex").toUpperCase()}`;
      }
    }
    await ctx.db.customerAccount.update({
      where: { id: ctx.session.userId },
      data: { virtualAddress: uniqueVirtualAddress },
    });
    return uniqueVirtualAddress;
  }),
  getProfile: protectedCustomerProcedure.query(async ({ ctx }) => {
    return ctx.db.customerAccount.findUniqueOrThrow({
      where: { id: ctx.session.userId },
      select: { firstName: true, lastName: true, email: true },
    });
  }),
  updateName: protectedCustomerProcedure
    .input(z.object({ firstName: nameSchema, lastName: nameSchema }))
    .mutation(async ({ ctx, input }) => {
      // Clerk is the identity source; keep the CustomerAccount copy (used for
      // label matching and pickup verification) in step with it.
      const clerk = await clerkClient();
      await clerk.users.updateUser(ctx.session.userId, {
        firstName: input.firstName,
        lastName: input.lastName,
      });
      return ctx.db.customerAccount.update({
        where: { id: ctx.session.userId },
        data: { firstName: input.firstName, lastName: input.lastName },
        select: { firstName: true, lastName: true },
      });
    }),
  // Account deletion is fulfilled by hand: the request is emailed to the
  // business inbox, which cancels billing and removes the account.
  requestAccountDeletion: protectedCustomerProcedure.mutation(
    async ({ ctx }) => {
      const customer = await ctx.db.customerAccount.findUniqueOrThrow({
        where: { id: ctx.session.userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          stripeCustomerId: true,
        },
      });
      try {
        await emailService.sendAccountDeletionRequest({
          customerId: customer.id,
          name: `${customer.firstName} ${customer.lastName}`.trim(),
          email: customer.email,
          phoneNumber: customer.phoneNumber,
          stripeCustomerId: customer.stripeCustomerId,
          requestedAt: new Date(),
        });
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "We couldn't send your request. Please try again or contact support.",
        });
      }
      return { success: true };
    },
  ),
  getVirtualAddress: protectedCustomerProcedure.query(async ({ ctx }) => {
    const customerAccount = await ctx.db.customerAccount.findUniqueOrThrow({
      where: { id: ctx.session.userId },
      select: { virtualAddress: true },
    });
    return customerAccount.virtualAddress;
  }),
});
