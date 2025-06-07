import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedCustomerProcedure } from "../trpc";

export const trustedContactsRouter = createTRPCRouter({
  // Get all trusted contacts for current user (both granted and received)
  getMyTrustedContacts: protectedCustomerProcedure.query(async ({ ctx }) => {
    const [grantedContacts, receivedContacts] = await Promise.all([
      // Contacts where current user granted access (current user is accountHolder)
      ctx.db.trustedContact.findMany({
        where: {
          accountHolderId: ctx.session.userId,
          status: "ACTIVE",
        },
        include: {
          trustedContact: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      // Contacts where current user received access (current user is trustedContact)
      ctx.db.trustedContact.findMany({
        where: {
          trustedContactId: ctx.session.userId,
          status: "ACTIVE",
        },
        include: {
          accountHolder: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return {
      grantedContacts,
      receivedContacts,
    };
  }),

  // Send invitation to add trusted contact
  sendInvitation: protectedCustomerProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      // Validate 3-contact limit
      const existingCount = await ctx.db.trustedContact.count({
        where: {
          accountHolderId: ctx.session.userId,
          status: { in: ["PENDING", "ACTIVE"] },
        },
      });

      if (existingCount >= 3) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Maximum of 3 trusted contacts allowed",
        });
      }

      // Prevent self-invitation
      const currentUser = await ctx.db.customerAccount.findUnique({
        where: { id: ctx.session.userId },
        select: { email: true },
      });
      console.log("currentUser", currentUser);
      console.log("input.email", input.email);
      if (currentUser?.email === input.email) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot add yourself as a trusted contact",
        });
      }

      // Check if user already exists in Clerk
      const clerk = await clerkClient();
      const existingUsers = await clerk.users.getUserList({
        emailAddress: [input.email],
      });

      let targetUserId: string;

      if (existingUsers.data.length > 0) {
        // User exists - get their ID
        targetUserId = existingUsers.data[0]!.id;
      } else {
        // Create new user in Clerk with passwordless flow
        const newUser = await clerk.users.createUser({
          emailAddress: [input.email],
          skipPasswordChecks: true,
          skipPasswordRequirement: true,
        });
        targetUserId = newUser.id;

        // TODO: Send welcome email to new user
        // For now, rely on in-person notification from inviter
      }

      // Race-safe user creation (may compete with webhook)
      try {
        await ctx.db.user.create({
          data: {
            id: targetUserId,
            userType: "CUSTOMER",
            customerAccount: {
              create: {
                email: input.email,
                // TODO: Handle race condition where API creates user before webhook
                // If API wins, webhook fails silently and firstName/lastName/phoneNumber remain null
                // Consider using upsert in webhook or updating fields when user first logs in
              },
            },
          },
        });
      } catch (error: any) {
        // Silently ignore duplicate key errors
        if (error.code !== "P2002") throw error;
      }

      // Check if trusted contact relationship already exists
      const existingRelationship = await ctx.db.trustedContact.findUnique({
        where: {
          accountHolderId_trustedContactId: {
            accountHolderId: ctx.session.userId,
            trustedContactId: targetUserId,
          },
        },
      });

      if (existingRelationship) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This person is already your trusted contact",
        });
      }

      // Create trusted contact invitation
      return await ctx.db.trustedContact.create({
        data: {
          accountHolderId: ctx.session.userId,
          trustedContactId: targetUserId,
          status: "PENDING",
        },
        include: {
          trustedContact: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });
    }),

  // Accept trusted contact invitation
  acceptInvitation: protectedCustomerProcedure
    .input(z.object({ trustedContactId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const updated = await ctx.db.trustedContact.updateMany({
        where: {
          accountHolderId: input.trustedContactId,
          trustedContactId: ctx.session.userId,
          status: "PENDING",
        },
        data: {
          status: "ACTIVE",
        },
      });

      if (updated.count === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found or already processed",
        });
      }

      return { success: true };
    }),

  // Decline trusted contact invitation
  declineInvitation: protectedCustomerProcedure
    .input(z.object({ trustedContactId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const deleted = await ctx.db.trustedContact.deleteMany({
        where: {
          accountHolderId: input.trustedContactId,
          trustedContactId: ctx.session.userId,
          status: "PENDING",
        },
      });

      if (deleted.count === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }

      return { success: true };
    }),

  // Remove trusted contact (revoke access)
  removeTrustedContact: protectedCustomerProcedure
    .input(z.object({ trustedContactId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const updated = await ctx.db.trustedContact.updateMany({
        where: {
          accountHolderId: ctx.session.userId,
          trustedContactId: input.trustedContactId,
          status: "ACTIVE",
        },
        data: {
          status: "REVOKED",
        },
      });

      if (updated.count === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Active trusted contact relationship not found",
        });
      }

      return { success: true };
    }),

  // Get pending invitations for current user (to accept/decline)
  getPendingInvitations: protectedCustomerProcedure.query(({ ctx }) => {
    return ctx.db.trustedContact.findMany({
      where: {
        trustedContactId: ctx.session.userId,
        status: "PENDING",
      },
      include: {
        accountHolder: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }),
});
