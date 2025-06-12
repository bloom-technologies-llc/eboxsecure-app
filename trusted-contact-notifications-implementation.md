# Trusted Contact Notifications & New User Support - Technical Implementation Document

## Overview

This document outlines the implementation of two key features for the trusted contact system:

1. **Email Notifications**: Using Resend API to send notification emails from `notifications@mailer.bloomtechnologies.co`
2. **New User Support**: Graceful handling of invitations to non-existent users with automated onboarding

## Current State Analysis

### Existing Implementation

The current trusted contact system (`packages/client-api/src/router/trustedContacts.ts`) handles two scenarios:

1. **Existing User**: Creates a Clerk user (if needed), creates a database user record, and creates a `TrustedContact` record with `PENDING` status
2. **Non-existing User**: Currently creates a Clerk user and database record, which results in incomplete user data (missing firstName, lastName, phoneNumber)

### Database Schema

Current `TrustedContact` model:

```prisma
model TrustedContact {
    id               String               @id @default(cuid())
    accountHolderId  String
    trustedContactId String
    status           TrustedContactStatus @default(PENDING)
    createdAt        DateTime             @default(now())
    updatedAt        DateTime             @updatedAt
    // ... relations
}
```

## Proposed Implementation

### 1. Database Schema Changes

#### New Model: PendingTrustedContactInvitation

```prisma
model PendingTrustedContactInvitation {
    id              String   @id @default(cuid())
    email           String
    accountHolderId String
    createdAt       DateTime @default(now())
    updatedAt       DateTime @updatedAt
    processed       Boolean  @default(false)

    accountHolder   CustomerAccount @relation(fields: [accountHolderId], references: [id], onDelete: Cascade)

    @@index([email])
    @@index([accountHolderId])
}
```

#### Environment Variables Addition

Add to relevant `env.ts` files:

```typescript
server: {
    // ... existing vars
    RESEND_API_KEY: z.string(),
    RESEND_FROM_EMAIL: z.string().default("notifications@mailer.bloomtechnologies.co"),
}
```

### 2. Dependencies

#### Add Resend to client-api package

```json
// packages/client-api/package.json
{
  "dependencies": {
    // ... existing dependencies
    "resend": "^3.2.0"
  }
}
```

### 3. Email Service Implementation

#### Create Email Service Module

**File**: `packages/client-api/src/services/emailService.ts`

```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "notifications@mailer.bloomtechnologies.co";

export interface TrustedContactExistingUserEmailData {
  recipientEmail: string;
  recipientName: string | null;
  inviterName: string;
  inviterEmail: string;
  acceptInvitationUrl: string;
}

export interface TrustedContactNewUserEmailData {
  recipientEmail: string;
  inviterName: string;
  inviterEmail: string;
  signUpUrl: string;
}

export class EmailService {
  async sendTrustedContactInvitationToExistingUser(
    data: TrustedContactExistingUserEmailData,
  ) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: data.recipientEmail,
        subject: "You've been invited as a trusted contact on EboxSecure",
        html: `
          <h2>You've been invited as a trusted contact!</h2>
          <p>Hi ${data.recipientName || "there"},</p>
          <p>${data.inviterName} (${data.inviterEmail}) has invited you to be their trusted contact on EboxSecure.</p>
          <p>As a trusted contact, you'll be able to:</p>
          <ul>
            <li>View their order details</li>
            <li>Generate QR codes to pick up their packages</li>
            <li>Help manage their deliveries</li>
          </ul>
          <p><a href="${data.acceptInvitationUrl}" style="background-color: #00698F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Accept Invitation</a></p>
          <p>If you don't want to accept this invitation, you can simply ignore this email.</p>
        `,
      });
    } catch (error) {
      // Silent failure as requested
      console.error("Failed to send invitation email to existing user:", error);
    }
  }

  async sendTrustedContactInvitationToNewUser(
    data: TrustedContactNewUserEmailData,
  ) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: data.recipientEmail,
        subject: "You've been invited to join EboxSecure",
        html: `
          <h2>You've been invited to join EboxSecure!</h2>
          <p>Hi there,</p>
          <p>${data.inviterName} (${data.inviterEmail}) wants to add you as their trusted contact on EboxSecure, but you'll need to create an account first.</p>
          <p>EboxSecure is a secure package management service that helps you track and manage deliveries.</p>
          <p><a href="${data.signUpUrl}" style="background-color: #00698F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Sign Up to Accept Invitation</a></p>
          <p>After you create your account, you'll automatically be connected as ${data.inviterName}'s trusted contact.</p>
        `,
      });
    } catch (error) {
      // Silent failure as requested
      console.error("Failed to send invitation email to new user:", error);
    }
  }
}

export const emailService = new EmailService();
```

### 4. Updated Trusted Contacts Router

#### Modified sendInvitation Mutation

**File**: `packages/client-api/src/router/trustedContacts.ts`

```typescript
sendInvitation: protectedCustomerProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
        // ... existing validation logic (3-contact limit, self-invitation check)

        // Check if user exists in Clerk
        const clerk = await clerkClient();
        const existingUsers = await clerk.users.getUserList({
            emailAddress: [input.email],
        });

        const currentUser = await ctx.db.customerAccount.findUnique({
            where: { id: ctx.session.userId },
            select: { firstName: true, lastName: true, email: true },
        });

        const inviterName = `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || currentUser?.email || 'Someone';

        if (existingUsers.data.length > 0) {
            // SCENARIO 1: Existing User
            const targetUserId = existingUsers.data[0]!.id;

            // Ensure user exists in our database (race-safe)
            try {
                await ctx.db.user.create({
                    data: {
                        id: targetUserId,
                        userType: "CUSTOMER",
                        customerAccount: {
                            create: {
                                email: input.email,
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
                inviterEmail: currentUser?.email || '',
                acceptInvitationUrl: `${process.env.VERCEL_URL}/settings/trusted-contacts`,
            });

            return trustedContact;
        } else {
            // SCENARIO 2: New User - Don't create Clerk user, just create pending invitation
            // Create pending invitation record (allows multiple invitations for same email)
            const pendingInvitation = await ctx.db.pendingTrustedContactInvitation.create({
                data: {
                    email: input.email,
                    accountHolderId: ctx.session.userId,
                },
            });

            // Send sign-up email to new user
            await emailService.sendTrustedContactInvitationToNewUser({
                recipientEmail: input.email,
                inviterName,
                inviterEmail: currentUser?.email || '',
                signUpUrl: `${process.env.VERCEL_URL}/sign-up`,
            });

            return {
                id: pendingInvitation.id,
                email: input.email,
                status: 'PENDING_SIGNUP',
                isPendingSignup: true
            };
        }
    }),
```

### 5. Enhanced Webhook Implementation

#### Updated Client-Web Webhook

**File**: `apps/client-web/src/app/api/webhook/clerk-create-user/route.ts`

```typescript
export async function POST(req: Request) {
  // ... existing webhook verification logic

  const { id: userId, email_addresses } = evt.data;
  const userEmail = email_addresses?.[0]?.email_address;

  if (!userId || !userEmail) {
    return new Response("Missing user data", { status: 400 });
  }

  // Race-safe user creation
  try {
    await db.user.create({
      data: {
        id: userId,
        userType: "CUSTOMER",
        customerAccount: {
          create: {
            firstName: evt.data.first_name,
            lastName: evt.data.last_name,
            email: userEmail,
            phoneNumber: evt.data.phone_numbers?.[0]?.phone_number ?? null,
          },
        },
      },
    });
  } catch (error: any) {
    if (error.code !== "P2002") {
      log.error("Error creating user in webhook:", error);
    }
  }

  // Check for pending trusted contact invitations
  const pendingInvitations = await db.pendingTrustedContactInvitation.findMany({
    where: {
      email: userEmail,
      processed: false,
    },
    include: {
      accountHolder: {
        select: { firstName: true, lastName: true, email: true },
      },
    },
  });

  // Process each pending invitation
  for (const invitation of pendingInvitations) {
    try {
      // Check if relationship already exists (in case of race conditions)
      const existingRelationship = await db.trustedContact.findUnique({
        where: {
          accountHolderId_trustedContactId: {
            accountHolderId: invitation.accountHolderId,
            trustedContactId: userId,
          },
        },
      });

      if (!existingRelationship) {
        // Create the trusted contact relationship
        await db.trustedContact.create({
          data: {
            accountHolderId: invitation.accountHolderId,
            trustedContactId: userId,
            status: "PENDING",
          },
        });
      }

      // Mark invitation as processed
      await db.pendingTrustedContactInvitation.update({
        where: { id: invitation.id },
        data: { processed: true },
      });

      // Send notification email to the new user about the invitation
      const inviterName =
        `${invitation.accountHolder.firstName || ""} ${invitation.accountHolder.lastName || ""}`.trim() ||
        invitation.accountHolder.email ||
        "Someone";

      await emailService.sendTrustedContactInvitationToExistingUser({
        recipientEmail: userEmail,
        recipientName: evt.data.first_name || null,
        inviterName,
        inviterEmail: invitation.accountHolder.email || "",
        acceptInvitationUrl: `${process.env.VERCEL_URL}/settings/trusted-contacts`,
      });
    } catch (error) {
      log.error(
        `Failed to process pending invitation ${invitation.id}:`,
        error,
      );
    }
  }

  return new Response("", { status: 200 });
}
```

### 6. Frontend Updates

#### Enhanced getSentPendingInvitations Query

**File**: `packages/client-api/src/router/trustedContacts.ts`

```typescript
getSentPendingInvitations: protectedCustomerProcedure.query(async ({ ctx }) => {
    const [trustedContactInvitations, pendingSignupInvitations] = await Promise.all([
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
    const pendingSignupFormatted = pendingSignupInvitations.map(invitation => ({
        id: invitation.id,
        trustedContactId: null,
        trustedContact: {
            firstName: null,
            lastName: null,
            email: invitation.email,
        },
        isPendingSignup: true,
        createdAt: invitation.createdAt,
    }));

    return [...trustedContactInvitations, ...pendingSignupFormatted];
}),
```

#### Updated UI Components

Both web and mobile `SentInvitationCard` components need updates to handle the new `isPendingSignup` status and display appropriate messaging:

- Show "Waiting for sign-up" instead of "Waiting for response"
- Display different messaging explaining the user needs to create an account first
- Possibly different styling to distinguish from regular pending invitations

### 7. Email Templates

The email templates are implemented directly in the EmailService class using basic HTML. Resend supports both HTML and React components for more advanced templates, but for now we're using simple HTML strings that can be easily customized.

### 8. Migration Strategy

#### Database Migration

```sql
-- Create PendingTrustedContactInvitation table
CREATE TABLE "PendingTrustedContactInvitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "accountHolderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "PendingTrustedContactInvitation_pkey" PRIMARY KEY ("id")
);

-- Add indexes
CREATE INDEX "PendingTrustedContactInvitation_email_idx" ON "PendingTrustedContactInvitation"("email");
CREATE INDEX "PendingTrustedContactInvitation_accountHolderId_idx" ON "PendingTrustedContactInvitation"("accountHolderId");

-- Add foreign key
ALTER TABLE "PendingTrustedContactInvitation" ADD CONSTRAINT "PendingTrustedContactInvitation_accountHolderId_fkey" FOREIGN KEY ("accountHolderId") REFERENCES "CustomerAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

### 9. Testing Strategy

#### Unit Tests

- Email service functionality
- Webhook processing logic
- Router mutations with both user scenarios

#### Integration Tests

- End-to-end invitation flow for existing users
- End-to-end invitation flow for new users
- Multiple pending invitations for same email
- Race condition handling between API and webhook

#### Manual Testing Scenarios

1. Invite existing user → verify email received → accept invitation
2. Invite non-existent user → verify sign-up email → create account → verify auto-invitation processing
3. Multiple invitations to same email → verify all are processed when user signs up
4. Race conditions between multiple invitation attempts

### 10. Monitoring & Observability

#### Metrics to Track

- Email delivery attempts (success/failure logged but silent)
- Invitation acceptance rates
- Time from invitation to acceptance
- Pending invitation processing success rates

#### Logging

- Email send attempts (errors logged but don't block flow)
- Pending invitation processing
- Race condition occurrences
- User creation webhook processing

### 11. Security Considerations

#### Data Protection

- Ensure email addresses in pending invitations are properly validated
- Implement rate limiting on invitation sending

#### Access Control

- Verify invitation sender permissions
- Validate email ownership during sign-up process

### 12. Performance Considerations

#### Database Optimization

- Add proper indexes on email lookups
- Optimize webhook processing for multiple pending invitations per user

#### Email Service

- Silent failure for email issues
- Monitor Resend API rate limits

## Implementation Timeline

### Phase 1: Foundation (Week 1)

- Database schema changes
- Email service implementation
- Basic email templates

### Phase 2: Core Logic (Week 2)

- Updated trusted contacts router
- Enhanced webhook implementation
- Frontend UI updates

### Phase 3: Testing & Polish (Week 3)

- Comprehensive testing
- Error handling improvements
- Performance optimization

### Phase 4: Deployment & Monitoring (Week 4)

- Production deployment
- Monitoring setup
- Documentation and training

## Risk Mitigation

### Email Delivery Issues

- Silent failure approach - system continues to work even if emails fail
- Monitor logs for patterns in email failures

### Race Conditions

- Use database transactions where appropriate
- Implement idempotent operations
- Handle duplicate relationship creation gracefully

### User Experience

- Clear messaging for different invitation states
- Proper loading states and error messages
- Intuitive invitation management interface

This implementation provides a robust foundation for trusted contact notifications while gracefully handling new user onboarding without creating premature Clerk users.
