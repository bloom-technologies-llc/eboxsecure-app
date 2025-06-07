# Trusted Contacts Feature Implementation Guide

## Overview

The Trusted Contacts feature allows customers to grant specific users permission to view their orders and generate pick-up QR codes. This is a unidirectional relationship where the account holder grants privileges to trusted contacts without reciprocal access.

## Product Requirements

### Core Functionality

- **Unidirectional Relationship**: Customer grants order viewing privileges to trusted contacts
- **Limit**: Maximum 3 trusted contacts per customer
- **Consent Required**: Trusted contacts must accept the relationship before it becomes active
- **Full Access**: Trusted contacts can view all order details and generate pick-up QR codes
- **Revocable**: Account holders can remove trusted contacts and revoke all privileges

### User Interface

- **Location**: Settings page with dedicated Trusted Contacts section
- **Cross-Platform**: Consistent functionality with platform-specific design patterns
- **Management**: Add, view, and remove trusted contacts interface

### Notification Strategy

- **Existing Users**: All invitations are in-app notifications only
- **New Users**: Email notifications only sent when user doesn't exist in EboxSecure ecosystem
- **In-Person Communication**: Primary expectation is that inviter notifies invitee in person

## Technical Requirements

### Database Schema Changes

#### New Models

```prisma
model TrustedContact {
  id               String              @id @default(cuid())
  accountHolderId  String              // Customer who granted access
  trustedContactId String              // Customer who received access
  status           TrustedContactStatus @default(PENDING)
  createdAt        DateTime            @default(now())
  updatedAt        DateTime            @updatedAt

  accountHolder    CustomerAccount     @relation("TrustedContactsGranted", fields: [accountHolderId], references: [id], onDelete: Cascade)
  trustedContact   CustomerAccount     @relation("TrustedContactsReceived", fields: [trustedContactId], references: [id], onDelete: Cascade)

  @@unique([accountHolderId, trustedContactId])
  @@index([accountHolderId])
  @@index([trustedContactId])
}

enum TrustedContactStatus {
  PENDING
  ACTIVE
  REVOKED
}
```

#### Model Updates

```prisma
model CustomerAccount {
  // ... existing fields ...

  // Trusted contact relationships
  trustedContactsGranted  TrustedContact[] @relation("TrustedContactsGranted")
  trustedContactsReceived TrustedContact[] @relation("TrustedContactsReceived")
}
```

### Clerk Integration Strategy

#### User Creation Flow

**For New Users:**

1. Create user in Clerk with passwordless flow
2. Attempt to create User + CustomerAccount in database (may race with webhook)
3. Create TrustedContact record with PENDING status
4. User receives notification when they first log in

**For Existing Users:**

1. Look up existing user ID in Clerk
2. Create TrustedContact record directly
3. User receives in-app notification

#### Race Condition Handling

Both the API endpoint and webhook attempt to create User + CustomerAccount records. Duplicate key errors are silently ignored to handle race conditions safely.

```typescript
// Race-safe user creation pattern
try {
  await db.user.create({
    data: {
      id: targetUserId,
      userType: "CUSTOMER",
      customerAccount: { create: { email: input.email } },
    },
  });
} catch (error) {
  // Silently ignore duplicate key errors (P2002)
  if (error.code !== "P2002") throw error;
}
```

### API Endpoints Structure

#### tRPC Router: `trustedContacts`

```typescript
// packages/client-api/src/router/trustedContacts.ts

export const trustedContactsRouter = createTRPCRouter({
  // Get all trusted contacts for current user (both granted and received)
  getMyTrustedContacts: protectedCustomerProcedure.query(({ ctx }) => {
    return ctx.db.trustedContact.findMany({
      where: {
        OR: [
          { accountHolderId: ctx.session.userId },
          { trustedContactId: ctx.session.userId },
        ],
      },
      include: {
        accountHolder: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
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

      if (currentUser?.email === input.email) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot add yourself as a trusted contact",
        });
      }

      // Check if user already exists in Clerk
      const clerkClient = await clerkClient();
      const existingUsers = await clerkClient.users.getUserList({
        emailAddress: [input.email],
      });

      let targetUserId: string;

      if (existingUsers.data.length > 0) {
        // User exists - get their ID
        targetUserId = existingUsers.data[0]!.id;
      } else {
        // Create new user in Clerk with passwordless flow
        const newUser = await clerkClient.users.createUser({
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
                // Other fields will be populated when user first logs in
              },
            },
          },
        });
      } catch (error) {
        // Silently ignore duplicate key errors
        if (error.code !== "P2002") throw error;
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
      return await ctx.db.trustedContact.updateMany({
        where: {
          accountHolderId: input.trustedContactId,
          trustedContactId: ctx.session.userId,
          status: "PENDING",
        },
        data: {
          status: "ACTIVE",
        },
      });
    }),

  // Decline trusted contact invitation
  declineInvitation: protectedCustomerProcedure
    .input(z.object({ trustedContactId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.trustedContact.deleteMany({
        where: {
          accountHolderId: input.trustedContactId,
          trustedContactId: ctx.session.userId,
          status: "PENDING",
        },
      });
    }),

  // Remove trusted contact (revoke access)
  removeTrustedContact: protectedCustomerProcedure
    .input(z.object({ trustedContactId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.trustedContact.updateMany({
        where: {
          accountHolderId: ctx.session.userId,
          trustedContactId: input.trustedContactId,
          status: "ACTIVE",
        },
        data: {
          status: "REVOKED",
        },
      });
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
```

#### Order Access Modifications

```typescript
// packages/client-api/src/router/order.ts

export const orderRouter = createTRPCRouter({
  getAllOrders: protectedCustomerProcedure.query(({ ctx }) => {
    return ctx.db.order.findMany({
      where: {
        OR: [
          // User's own orders
          { customerId: ctx.session.userId },
          // Orders from accounts where user is a trusted contact
          {
            customer: {
              trustedContactsGranted: {
                some: {
                  trustedContactId: ctx.session.userId,
                  status: "ACTIVE",
                },
              },
            },
          },
        ],
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        shippedLocation: {
          select: {
            name: true,
            address: true,
          },
        },
      },
    });
  }),

  // Generate pickup QR code for order (including trusted contact orders)
  generatePickupQR: protectedCustomerProcedure
    .input(z.object({ orderId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Verify user has access to this order
      const order = await ctx.db.order.findFirst({
        where: {
          id: input.orderId,
          OR: [
            { customerId: ctx.session.userId },
            {
              customer: {
                trustedContactsGranted: {
                  some: {
                    trustedContactId: ctx.session.userId,
                    status: "ACTIVE",
                  },
                },
              },
            },
          ],
        },
      });

      if (!order) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this order",
        });
      }

      // Generate QR code logic here
      // Return QR code data/URL
    }),
});
```

#### Webhook Updates

```typescript
// apps/client-web/src/app/api/webhook/clerk-create-user/route.ts

// Race-safe user creation (may compete with API)
try {
  await db.user.create({
    data: {
      id: userId,
      userType: "CUSTOMER",
      customerAccount: {
        create: {
          firstName: evt.data.first_name,
          lastName: evt.data.last_name,
          email: evt.data.email_addresses?.[0]?.email_address ?? null,
          phoneNumber: evt.data.phone_numbers?.[0]?.phone_number ?? null,
        },
      },
    },
  });
} catch (error) {
  // Silently ignore duplicate key errors (API beat us to it)
  if (error.code !== "P2002") {
    // Log other errors but don't fail the webhook
    console.error("Error creating user in webhook:", error);
  }
}
```

### User Interface Components

#### Web Application (Next.js)

**Settings Page Integration**

```typescript
// apps/client-web/src/app/(dashboard)/settings/page.tsx

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* ... existing settings items ... */}

      <SettingsItem
        title="Trusted Contacts"
        description="Manage who can view your orders and pick up packages"
        href="/settings/trusted-contacts"
        icon={<UsersIcon className="h-5 w-5" />}
      />
    </div>
  );
}
```

**Trusted Contacts Management Page**

```typescript
// apps/client-web/src/app/(dashboard)/settings/trusted-contacts/page.tsx

export default function TrustedContactsPage() {
  const { data: trustedContacts } = api.trustedContacts.getMyTrustedContacts.useQuery();
  const { data: pendingInvitations } = api.trustedContacts.getPendingInvitations.useQuery();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Trusted Contacts</h1>
        <AddTrustedContactButton />
      </div>

      {/* Pending invitations for current user to accept */}
      {pendingInvitations && pendingInvitations.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Pending Invitations</h2>
          <div className="space-y-2">
            {pendingInvitations.map((invitation) => (
              <InvitationCard key={invitation.id} invitation={invitation} />
            ))}
          </div>
        </section>
      )}

      {/* Active trusted contacts */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Active Trusted Contacts</h2>
        <TrustedContactsList contacts={trustedContacts} />
      </section>
    </div>
  );
}
```

**Key Components**

- `AddTrustedContactModal`: Email input and confirmation modal
- `TrustedContactCard`: Display trusted contact with remove option
- `InvitationCard`: Show pending invitations with accept/decline options
- `NotificationSystem`: In-app notifications for new trusted contact requests

#### Mobile Application (React Native/Expo)

**Settings Screen Integration**

```typescript
// apps/client-mobile/app/(tabs)/(profile)/settings/index.tsx

export default function SettingsScreen() {
  return (
    <ScrollView className="flex-1 bg-white">
      {/* ... existing settings items ... */}

      <SettingsItem
        title="Trusted Contacts"
        description="Manage who can view your orders"
        onPress={() => router.push('/settings/trusted-contacts')}
        icon="users"
      />
    </ScrollView>
  );
}
```

**Trusted Contacts Screen**

```typescript
// apps/client-mobile/app/settings/trusted-contacts/index.tsx

export default function TrustedContactsScreen() {
  const { data: trustedContacts } = api.trustedContacts.getMyTrustedContacts.useQuery();
  const { data: pendingInvitations } = api.trustedContacts.getPendingInvitations.useQuery();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-4">
        {/* Pending invitations */}
        {pendingInvitations && pendingInvitations.length > 0 && (
          <PendingInvitationsList invitations={pendingInvitations} />
        )}

        {/* Active trusted contacts */}
        <TrustedContactsList contacts={trustedContacts} />

        <AddTrustedContactButton />
      </View>
    </SafeAreaView>
  );
}
```

## Implementation Steps

### Phase 1: Database Schema & Core API (Priority: High)

1. **Database Migration**

   - Add `TrustedContact` model with relationships
   - Update `CustomerAccount` model
   - Add `TrustedContactStatus` enum
   - Run migration and update Prisma client

2. **Core tRPC Endpoints**

   - Implement `trustedContacts` router with all endpoints
   - Add validation for 3-contact limit and self-invitation prevention
   - Implement race-safe user creation logic
   - Update order queries to include trusted contact access

3. **Webhook Updates**

   - Make user creation webhook race-condition safe
   - Add error handling for duplicate key scenarios

4. **Testing**
   - Unit tests for all endpoints
   - Test race condition scenarios
   - Test invitation limit enforcement
   - Test order access permissions

### Phase 2: User Interface Development (Priority: High)

5. **Web Application UI**

   - Create settings page integration
   - Build trusted contacts management page
   - Implement add/remove functionality
   - Create confirmation modals and notification system

6. **Mobile Application UI**

   - Mirror web functionality with native components
   - Implement platform-specific design patterns
   - Ensure consistent behavior across platforms

7. **Cross-Platform Testing**
   - Test UI consistency and functionality
   - Verify responsive design
   - Test user flows end-to-end

### Phase 3: Clerk Integration & Polish (Priority: Medium)

8. **Clerk Integration**

   - Implement user lookup and creation logic
   - Handle passwordless user creation
   - Add proper error handling for Clerk API failures

9. **Notification System**

   - Implement in-app notifications for existing users
   - Add email notifications for new users (TODO: currently manual)
   - Handle notification delivery and read states

10. **End-to-End Testing**
    - Test complete invitation flow for existing users
    - Test complete invitation flow for new users
    - Verify race condition handling works in production scenarios

### Phase 4: Performance & Monitoring (Priority: Low)

11. **Performance Optimization**

    - Optimize database queries with proper indexing
    - Add caching where beneficial
    - Implement proper pagination

12. **Monitoring & Analytics**

    - Add metrics tracking for invitation success/failure rates
    - Monitor performance of new queries
    - Set up alerts for webhook failures

### Phase 5: Stretch Goals

13. **Account Cleanup** (Stretch Goal)

    - Implement background job to clean up unused accounts
    - Define account activation criteria
    - Add configurable cleanup policies

14. **Enhanced Features** (Stretch Goal)
    - Custom invitation messages
    - Temporary access permissions
    - Audit logs for trusted contact changes

## Security Considerations

- **Access Control**: Verify user permissions for all trusted contact operations
- **Data Validation**: Sanitize and validate all email inputs
- **Rate Limiting**: Prevent spam invitations (consider implementing rate limits)
- **Audit Trail**: Log all trusted contact changes for security monitoring
- **Session Management**: Ensure proper authentication for all operations
- **Race Condition Safety**: Handle concurrent user creation attempts safely

## Performance Considerations

- **Database Indexes**: Indexes on accountHolderId and trustedContactId for TrustedContact model
- **Query Optimization**: Use appropriate joins and select specific fields in order queries
- **Error Handling**: Graceful handling of Clerk API failures and rate limits
- **Webhook Reliability**: Ensure webhook failures don't break the user experience

## Monitoring & Analytics

- **Metrics**: Track invitation success rates, acceptance rates, API response times
- **Usage**: Monitor feature adoption and usage patterns
- **Errors**: Alert on Clerk API failures, webhook issues, and database errors
- **Performance**: Monitor query performance, especially for order access with trusted contacts

## Technical Notes

### Race Condition Handling

The implementation uses a "optimistic creation" approach where both the API endpoint and webhook attempt to create user records. This ensures that regardless of timing, the user will exist before creating trusted contact relationships.

### Clerk Integration

- Users are created with passwordless flow requiring password setup on first login
- Email notifications are handled manually for now (TODO: implement automated emails)
- Existing user detection uses Clerk's email lookup API

### Database Design

- No pending invitation table needed due to immediate user creation
- TrustedContact status tracks the relationship lifecycle
- Unique constraints prevent duplicate relationships
- Cascade deletes ensure data consistency when users are removed
