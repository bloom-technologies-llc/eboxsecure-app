import { clerkClient } from "@clerk/nextjs/server";
import {
  EmployeeRole,
  PendingAdminAccountStatus,
  UserType,
} from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { Resend } from "resend";
import { z } from "zod";

import { createTRPCRouter, protectedAdminProcedure } from "../trpc";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "notifications@mailer.bloomtechnologies.co";
const ADMIN_PORTAL_BASE_URL =
  process.env.ADMIN_PORTAL_BASE_URL || "http://localhost:3000";

const getInvitationAccess = async (userId: string, db: any) => {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { userType: true },
  });

  if (user?.userType === UserType.CORPORATE) {
    return { isCorporate: true, locationId: null };
  }

  if (user?.userType === UserType.EMPLOYEE) {
    const employee = await db.employeeAccount.findUnique({
      where: { id: userId },
      select: { locationId: true, employeeRole: true },
    });

    if (!employee || employee.employeeRole !== EmployeeRole.MANAGER) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Only managers can manage invitations",
      });
    }

    return { isCorporate: false, locationId: employee.locationId };
  }

  throw new TRPCError({ code: "UNAUTHORIZED" });
};

export const invitationsRouter = createTRPCRouter({
  createInvitation: protectedAdminProcedure
    .input(
      z
        .object({
          email: z.string().email(),
          accountType: z.enum(["EMPLOYEE", "CORPORATE"]),
          employeeRole: z.nativeEnum(EmployeeRole).optional(),
          locationId: z.number().optional(),
        })
        .refine(
          (data) => {
            if (data.accountType === "EMPLOYEE") {
              return (
                data.employeeRole !== undefined && data.locationId !== undefined
              );
            }
            return true;
          },
          {
            message:
              "Employee role and location are required for employee accounts",
          },
        ),
    )
    .mutation(async ({ ctx, input }) => {
      const access = await getInvitationAccess(ctx.session.userId, ctx.db);

      // Managers can only invite employees to their own location
      if (!access.isCorporate) {
        if (input.accountType === "CORPORATE") {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Only corporate users can invite corporate accounts",
          });
        }
        if (input.locationId !== access.locationId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You can only invite employees to your own location",
          });
        }
      }

      // Check for existing pending invitation
      const existingPending = await ctx.db.pendingAdminAccount.findUnique({
        where: { email: input.email },
      });

      if (
        existingPending &&
        existingPending.status === PendingAdminAccountStatus.PENDING
      ) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An invitation is already pending for this email",
        });
      }

      // Check if user already exists in Clerk
      const clerk = await clerkClient();
      const existingUsers = await clerk.users.getUserList({
        emailAddress: [input.email],
      });

      if (existingUsers.data.length > 0) {
        // Check if any of these users already have an admin account
        const existingUser = existingUsers.data[0];
        if (existingUser) {
          const dbUser = await ctx.db.user.findUnique({
            where: { id: existingUser.id },
          });
          if (dbUser) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "A user with this email already has an account",
            });
          }
        }
      }

      // If there's a revoked invitation for this email, delete it first
      if (
        existingPending &&
        existingPending.status === PendingAdminAccountStatus.REVOKED
      ) {
        await ctx.db.pendingAdminAccount.delete({
          where: { id: existingPending.id },
        });
      }

      // Create the pending admin account
      const pending = await ctx.db.pendingAdminAccount.create({
        data: {
          email: input.email,
          accountType: input.accountType,
          employeeRole:
            input.accountType === "EMPLOYEE" ? input.employeeRole : null,
          locationId:
            input.accountType === "EMPLOYEE" ? input.locationId : null,
          invitedById: ctx.session.userId,
        },
      });

      // Send invite email
      const signUpUrl = `${ADMIN_PORTAL_BASE_URL}/sign-in`;
      const roleLabel =
        input.accountType === "CORPORATE"
          ? "Corporate Admin"
          : `${input.employeeRole === "MANAGER" ? "Manager" : "Associate"} Employee`;

      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: input.email,
          subject: "You've been invited to join EboxSecure Admin",
          html: `
            <html>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #00698F; margin-bottom: 20px;">You've been invited to EboxSecure Admin!</h2>
                <p>Hi there,</p>
                <p>You've been invited to join EboxSecure as a <strong>${roleLabel}</strong>.</p>
                ${input.accountType === "EMPLOYEE" ? "<p>Once you sign up, you'll be assigned to your designated location.</p>" : "<p>As a corporate admin, you'll have full access to all locations and features.</p>"}

                <table role="presentation" style="margin: 30px 0;">
                  <tr>
                    <td>
                      <a href="${signUpUrl}" style="display: inline-block; background-color: #00698F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Sign Up Now</a>
                    </td>
                  </tr>
                </table>

                <p style="color: #666; font-size: 14px;">Please sign up using this email address (${input.email}) to ensure your account is properly configured.</p>
                <p style="color: #666; font-size: 14px;">If the button doesn't work, you can copy and paste this link: ${signUpUrl}</p>
              </body>
            </html>
          `,
        });
      } catch (error) {
        console.error("Failed to send admin invite email:", error);
      }

      return { success: true, id: pending.id };
    }),

  getPendingInvitations: protectedAdminProcedure.query(
    async ({ ctx, input }) => {
      const access = await getInvitationAccess(ctx.session.userId, ctx.db);

      const where: any = {
        status: PendingAdminAccountStatus.PENDING,
      };

      if (!access.isCorporate) {
        where.locationId = access.locationId;
        where.accountType = "EMPLOYEE";
      }

      const [invitations, totalCount] = await Promise.all([
        ctx.db.pendingAdminAccount.findMany({
          where,
          include: {
            location: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        ctx.db.pendingAdminAccount.count({ where }),
      ]);

      return {
        invitations: invitations.map((inv) => ({
          id: inv.id,
          email: inv.email,
          accountType: inv.accountType,
          employeeRole: inv.employeeRole,
          locationName: inv.location?.name ?? null,
          createdAt: inv.createdAt,
        })),
      };
    },
  ),

  revokeInvitation: protectedAdminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const access = await getInvitationAccess(ctx.session.userId, ctx.db);

      const invitation = await ctx.db.pendingAdminAccount.findUnique({
        where: { id: input.id },
      });

      if (!invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }

      if (invitation.status !== PendingAdminAccountStatus.PENDING) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only pending invitations can be revoked",
        });
      }

      // Managers can only revoke employee invitations at their location
      if (!access.isCorporate) {
        if (
          invitation.accountType !== "EMPLOYEE" ||
          invitation.locationId !== access.locationId
        ) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You can only revoke invitations for your location",
          });
        }
      }

      await ctx.db.pendingAdminAccount.update({
        where: { id: input.id },
        data: { status: PendingAdminAccountStatus.REVOKED },
      });

      return { success: true };
    }),
});
