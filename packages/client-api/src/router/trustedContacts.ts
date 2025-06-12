import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { emailService } from "../services/emailService";
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
        select: { firstName: true, lastName: true, email: true },
      });

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

      const inviterName =
        `${currentUser?.firstName || ""} ${currentUser?.lastName || ""}`.trim() ||
        currentUser?.email ||
        "Someone";

      if (existingUsers.data.length > 0) {
        // User exists in Clerk - they should also exist in our database
        const targetUserId = existingUsers.data[0]!.id;

        const existingDatabaseUser = await ctx.db.user.findUnique({
          where: { id: targetUserId },
        });

        if (!existingDatabaseUser) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              "User exists in Clerk but not in database. Please try again in a few seconds.",
          });
        }

        // SCENARIO 1: Existing User (both Clerk and database)
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

        // Create trusted contact relationship
        const trustedContact = await ctx.db.trustedContact.create({
          data: {
            accountHolderId: ctx.session.userId,
            trustedContactId: targetUserId,
            status: "PENDING",
          },
          include: {
            trustedContact: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        });

        // Send notification email to existing user
        await emailService.sendTrustedContactInvitationToExistingUser({
          recipientEmail: input.email,
          recipientName: trustedContact.trustedContact.firstName || null,
          inviterName,
          inviterEmail: currentUser?.email || "",
          acceptInvitationUrl: `${process.env.VERCEL_URL}/settings/trusted-contacts`,
        });

        return trustedContact;
      } else {
        // SCENARIO 2: New User (no Clerk account)
        // Create pending invitation record (allows multiple invitations for same email)
        const pendingInvitation =
          await ctx.db.pendingTrustedContactInvitation.create({
            data: {
              email: input.email,
              accountHolderId: ctx.session.userId,
            },
          });

        // Send sign-up email to new user
        await emailService.sendTrustedContactInvitationToNewUser({
          recipientEmail: input.email,
          inviterName,
          inviterEmail: currentUser?.email || "",
          signUpUrl: `${process.env.VERCEL_URL}/sign-up`,
        });

        return {
          id: pendingInvitation.id,
          email: input.email,
          status: "PENDING_SIGNUP",
          isPendingSignup: true,
        };
      }
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

  // Remove trusted contact (delete relationship)
  removeTrustedContact: protectedCustomerProcedure
    .input(z.object({ trustedContactId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const deleted = await ctx.db.trustedContact.deleteMany({
        where: {
          accountHolderId: ctx.session.userId,
          trustedContactId: input.trustedContactId,
          status: { in: ["ACTIVE", "PENDING"] },
        },
      });

      if (deleted.count === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Trusted contact relationship not found",
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

  // Get pending invitations sent by current user (awaiting acceptance)
  getSentPendingInvitations: protectedCustomerProcedure.query(
    async ({ ctx }) => {
      const [trustedContactInvitations, pendingSignupInvitations] =
        await Promise.all([
          // Existing trusted contact invitations
          ctx.db.trustedContact.findMany({
            where: {
              accountHolderId: ctx.session.userId,
              status: "PENDING",
            },
            include: {
              trustedContact: {
                select: { firstName: true, lastName: true, email: true },
              },
            },
          }),

          // Pending signup invitations
          ctx.db.pendingTrustedContactInvitation.findMany({
            where: {
              accountHolderId: ctx.session.userId,
              processed: false,
            },
          }),
        ]);

      // Transform pending signups to match expected format
      const pendingSignupFormatted = pendingSignupInvitations.map(
        (invitation) => ({
          id: invitation.id,
          trustedContactId: null,
          trustedContact: {
            firstName: null,
            lastName: null,
            email: invitation.email,
          },
          isPendingSignup: true,
          createdAt: invitation.createdAt,
        }),
      );

      return [...trustedContactInvitations, ...pendingSignupFormatted];
    },
  ),
});
