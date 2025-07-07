import type { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { env } from "@/env";
import log from "@/logger";
import { Webhook } from "svix";

import { db } from "@ebox/db";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = env.CLERK_CREATE_USER_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_CREATE_USER_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local",
    );
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    log.error("Error occurred on clerk create user webhook -- no svix headers");
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);
  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    log.error(`Error verifying webhook in clerk-create-user webhook: ${err}`);
    return new Response("Error verifying webhook", {
      status: 400,
    });
  }
  const eventType = evt.type;
  if (eventType !== "user.created") {
    log.error(
      `Received unexpected event type in clerk-create-user webhook: ${eventType}`,
    );
    return new Response(`Received unexpected event type: ${eventType}`, {
      status: 400,
    });
  }
  const { id: userId, email_addresses, first_name, last_name } = evt.data;
  const userEmail = email_addresses?.[0]?.email_address;

  if (!userId || !userEmail || !first_name || !last_name) {
    log.error(
      "Unexpectedly missing user ID, email, first name, or last name in clerk-create-user webhook",
    );
    return new Response(
      "Unexpectedly missing user ID, email, first name, or last name",
      {
        status: 400,
      },
    );
  }

  // Create user
  try {
    await db.user.create({
      data: {
        id: userId,
        userType: "CUSTOMER",
        customerAccount: {
          create: {
            firstName: first_name!,
            lastName: last_name!,
            email: userEmail,
            phoneNumber: evt.data.phone_numbers?.[0]?.phone_number ?? null,
          },
        },
      },
    });

    // Check for pending trusted contact invitations
    const pendingInvitations =
      await db.pendingTrustedContactInvitation.findMany({
        where: {
          email: userEmail,
          processed: false,
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
      } catch (error: any) {
        log.error(
          `Failed to process pending invitation ${invitation.id}:`,
          error,
        );
      }
    }
  } catch (error: any) {
    if (error.code !== "P2002") {
      // Non-duplicate errors indicate a real problem
      log.error("Failed to create user in webhook:", error);
      return new Response("Failed to create user", { status: 500 });
    }
  }

  return new Response("", { status: 200 });
}
