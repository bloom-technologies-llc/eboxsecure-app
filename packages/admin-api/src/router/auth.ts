import type { JWTPayload } from "jose";
import { TRPCError } from "@trpc/server";
import { jwtDecrypt } from "jose";
import { JWTExpired } from "jose/errors";
import { z } from "zod";

import { getPortraitUrl } from "../lib/user";
import { createTRPCRouter, protectedAdminProcedure } from "../trpc";

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
  authenticateAuthorizedPickupToken: protectedAdminProcedure
    .input(
      z.object({
        pickupToken: z.string(),
      }),
    )
    .output(
      z.discriminatedUnion("authorized", [
        z.object({
          authorized: z.literal(true),
          orderId: z.number(),
          customerId: z.string(),
          portraitUrl: z.string(),
          firstName: z.string(),
          lastName: z.string(),
        }),
        z.object({
          authorized: z.literal(false),
          message: z.string(),
        }),
      ]),
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

      let decryption = undefined;

      try {
        const secret = Buffer.from(PICKUP_TOKEN_JWT_SECRET_KEY, "base64");
        decryption = await jwtDecrypt<AuthorizedPickupTokenPayload>(
          input.pickupToken,
          secret,
          {
            issuer: PICKUP_TOKEN_ISSUER,
            audience: PICKUP_TOKEN_AUDIENCE,
          },
        );
      } catch (error) {
        console.error(`Unable to decrypt pickupToken: ${error}`);

        if (error instanceof JWTExpired) {
          return {
            authorized: false,
            message: "QR Code Expired. Please create a new one and try again.",
          };
        }
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or corrupted QR code. Please try again.",
        });
      }

      const { payload } = decryption;

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
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: `Session not found.`,
        });
      }
      if (payloadSession.status !== "ACTIVE") {
        console.error(`Session ID ${payload.sessionId} is not active.`);
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Session is not active.",
        });
      }
      // ensure valid order ID
      const order = await ctx.db.order.findUnique({
        where: {
          id: payload.orderId,
        },
        include: {
          customer: true,
        },
      });
      if (!order) {
        console.error(`Order ID ${payload.orderId} not found in database.`);
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found.",
        });
      }
      // ensure order belongs to given session's user ID
      if (order.customerId !== payloadSession.userId) {
        console.error(
          `Given session's user ID ${payloadSession.userId} does not match order's customer ID ${order.customerId}.`,
        );
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Session does not match order owner.",
        });
      }

      if (order.pickedUpAt) {
        console.error(
          `Given session's user ID ${payloadSession.userId} attempted to pick up Order ID ${order.id}, which was already picked up.`,
        );
        throw new TRPCError({
          code: "CONFLICT",
          message: "This order has already been picked up.",
        });
      }

      const { firstName, lastName } = order.customer;

      // fetch portrait URL from database
      const portraitUrl = await getPortraitUrl(ctx.db, payloadSession.userId);

      return {
        authorized: true,
        orderId: order.id,
        customerId: order.customerId,
        portraitUrl,
        firstName,
        lastName,
      };
    }),
});
