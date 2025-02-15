import type { WebhookEvent } from "@clerk/nextjs/server";
import type { SessionStatus } from "@prisma/client";
import { headers } from "next/headers";
import { env } from "@/env";
import log from "@/logger";
import { Webhook } from "svix";

import { db } from "@ebox/db";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = env.CLERK_MANAGE_SESSION_WEBHOOK_SECRET;

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
    log.error(
      "Error occurred on clerk manage session webhook -- no svix headers",
    );
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
    log.error(
      `Error verifying webhook in clerk-manage-session webhook: ${err}`,
    );
    return new Response("Error verifying webhook", {
      status: 400,
    });
  }
  const eventType = evt.type;
  if (
    eventType !== "session.created" &&
    eventType !== "session.ended" &&
    eventType !== "session.revoked" &&
    eventType !== "session.removed"
  ) {
    log.error(
      `Received unexpected event type in clerk-manage-session webhook: ${eventType}`,
    );
    return new Response(`Received unexpected event type: ${eventType}`, {
      status: 400,
    });
  }
  const { id: sessionId, status: sessionStatus, user_id: userId } = evt.data;

  await db.session.upsert({
    where: {
      id: sessionId,
    },
    update: {
      status: sessionStatus.toUpperCase() as SessionStatus,
    },
    create: {
      id: sessionId,
      userId,
      status: sessionStatus.toUpperCase() as SessionStatus,
    },
  });
  return new Response("", { status: 200 });
}
