import type { JWTPayload } from "jose";
import { TRPCError } from "@trpc/server";
import { jwtDecrypt } from "jose";
import { z } from "zod";

import { createTRPCRouter, protectedCorporateProcedure } from "../trpc";

const {
  PICKUP_TOKEN_JWT_SECRET_KEY,
  PICKUP_TOKEN_ISSUER,
  PICKUP_TOKEN_AUDIENCE,
} = process.env;

interface AuthorizedPickupTokenPayload extends JWTPayload {
  sessionId: string;
  orderId: number;
}

// TODO: write unit tests for this
export const authRouter = createTRPCRouter({
  authenticateAuthorizedPickupToken: protectedCorporateProcedure
    .input(
      z.object({
        pickupToken: z.string(),
      }),
    )
    .output(
      z.object({
        authorized: z.boolean(),
        url: z.string().optional(),
        orderId: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (
        !PICKUP_TOKEN_JWT_SECRET_KEY ||
        !PICKUP_TOKEN_ISSUER ||
        !PICKUP_TOKEN_AUDIENCE
      ) {
        console.error(
          "Please add PICKUP_TOKEN_JWT_SECRET_KEY, PICKUP_TOKEN_ISSUER, and PICKUP_TOKEN_AUDIENCE to environment variables",
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Server misconfiguration. Please contact support.",
        });
      }

      try {
        const secret = Buffer.from(PICKUP_TOKEN_JWT_SECRET_KEY, "base64");
        const { payload } = await jwtDecrypt<AuthorizedPickupTokenPayload>(
          input.pickupToken,
          secret,
          {
            issuer: PICKUP_TOKEN_ISSUER,
            audience: PICKUP_TOKEN_AUDIENCE,
          },
        );

        // ensure valid session ID
        const payloadSession = await ctx.db.session.findUnique({
          where: {
            id: payload.sessionId,
          },
        });
        if (!payloadSession) {
          console.error(
            `Session ID ${payload.sessionId} not found in database as valid session.`,
          );
          return { authorized: false };
        }
        if (payloadSession.status !== "ACTIVE") {
          console.error(`Session ID ${payload.sessionId} is not active.`);
          return { authorized: false };
        }
        // ensure valid order ID
        const order = await ctx.db.order.findUnique({
          where: {
            id: payload.orderId,
          },
        });
        if (!order) {
          console.error(`Order ID ${payload.orderId} not found in database.`);
          return { authorized: false };
        }
        // ensure order belongs to given session's user ID
        if (order.customerId !== payloadSession.userId) {
          console.error(
            `Given session's user ID ${payloadSession.userId} does not match order's customer ID ${order.customerId}.`,
          );
          return { authorized: false };
        }

        if (order.pickedUpAt) {
          console.error(
            `Given session's user ID ${payloadSession.userId} attempted to pick up Order ID ${order.id}, which was already picked up.`,
          );
          return { authorized: false };
        }

        // fetch portrait URL from database
        const url = await getPortraitUrl(ctx, payloadSession.userId);
        return { authorized: true, url, orderId: order.id };
      } catch (error) {
        console.error(`Unable to decrypt pickupToken: ${error}`);
        return { authorized: false };
      }
    }),
});

async function getPortraitUrl(ctx: any, userId: string) {
  const customerAccount = await ctx.db.customerAccount.findUnique({
    where: {
      id: userId,
    },
    select: {
      photoLink: true,
    },
  });

  if (!customerAccount?.photoLink) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Portrait photo not found for this customer.",
    });
  }

  return customerAccount.photoLink;
}
