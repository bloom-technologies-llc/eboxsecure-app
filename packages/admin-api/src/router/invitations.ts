import { clerkClient } from "@clerk/nextjs/server";
import { EmployeeRole, UserType } from "@prisma/client";
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

      // Guard against inviting someone who already has an account
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

      // Eagerly create the Clerk user WITHOUT a password. The account exists
      // and is loginable immediately; the invitee sets a password on first
      // sign-in via "Forgot password?" / email code.
      const clerkUser = await clerk.users.createUser({
        emailAddress: [input.email],
        skipPasswordRequirement: true,
      });

      // Provision the DB account synchronously, using the invite's real role
      // and location (never hardcoded). Mirrors the clerk-create-user webhook.
      try {
        if (input.accountType === "EMPLOYEE") {
          await ctx.db.user.create({
            data: {
              id: clerkUser.id,
              userType: "EMPLOYEE",
              employeeAccount: {
                create: {
                  employeeRole: input.employeeRole ?? "ASSOCIATE",
                  locationId: input.locationId!,
                },
              },
            },
          });
        } else {
          await ctx.db.user.create({
            data: {
              id: clerkUser.id,
              userType: "CORPORATE",
              corporateAccount: {
                create: {},
              },
            },
          });
        }
      } catch (error) {
        // Roll back the Clerk user so we never leave an orphan.
        console.error(
          "Failed to provision DB account for invited admin; rolling back Clerk user:",
          error,
        );
        try {
          await clerk.users.deleteUser(clerkUser.id);
        } catch (rollbackError) {
          console.error(
            "Failed to roll back Clerk user after DB provisioning error:",
            rollbackError,
          );
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create account for invitation",
        });
      }

      // Send invite email
      const signInUrl = `${ADMIN_PORTAL_BASE_URL}/sign-in`;
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
                <p>Your account is ready to use. Sign in with this email address (${input.email}) at the link below.</p>
                <p>On your first sign-in, choose <strong>"Forgot password?"</strong> to set your password (a verification code will be sent to this email).</p>

                <table role="presentation" style="margin: 30px 0;">
                  <tr>
                    <td>
                      <a href="${signInUrl}" style="display: inline-block; background-color: #00698F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Sign In</a>
                    </td>
                  </tr>
                </table>

                <p style="color: #666; font-size: 14px;">Please sign in using this email address (${input.email}) to ensure your account is properly configured.</p>
                <p style="color: #666; font-size: 14px;">If the button doesn't work, you can copy and paste this link: ${signInUrl}</p>
              </body>
            </html>
          `,
        });
      } catch (error) {
        console.error("Failed to send admin invite email:", error);
      }

      return { success: true, id: clerkUser.id };
    }),
});
