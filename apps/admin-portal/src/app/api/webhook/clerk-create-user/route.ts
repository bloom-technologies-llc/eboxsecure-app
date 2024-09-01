import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";

import { db } from "@ebox/db";

import { env } from "~/env";

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
    return new Response("Error occured -- no svix headers", {
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
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred", {
      status: 400,
    });
  }

  const eventType = evt.type;
  if (eventType !== "user.created") {
    return new Response(`Received unexpected event type: ${eventType}`, {
      status: 400,
    });
  }
  const { id: userId } = evt.data;
  if (!userId) {
    return new Response("Unexpectedly missing user ID", { status: 400 });
  }
  const pendingAccount = await db.pendingAccount.findUnique({
    where: {
      email: userId,
    },
  });

  if (pendingAccount) {
    if (pendingAccount.accountType === "EMPLOYEE") {
      // TODO: add employee location connection
      await db.user.create({
        data: {
          id: userId,
          userType: "EMPLOYEE",
          employeeAccount: {
            create: {},
          },
        },
      });
    }
    await db.user.create({
      data: {
        id: userId,
        userType: "CORPORATE",
        corporateAccount: {
          create: {},
        },
      },
    });
    await db.pendingAccount.delete({
      where: {
        id: pendingAccount.id,
      },
    });
    return new Response("", { status: 200 });
  }

  await db.user.create({
    data: {
      id: userId,
      userType: "CUSTOMER",
      customerAccount: {
        create: {},
      },
    },
  });

  return new Response("", { status: 200 });
}