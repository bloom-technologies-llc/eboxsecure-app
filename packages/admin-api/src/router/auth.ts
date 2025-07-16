import type { JWTPayload } from "jose";
import { TRPCError } from "@trpc/server";
import { jwtDecrypt } from "jose";
import { JWTExpired } from "jose/errors";
import { z } from "zod";

import { getPortraitUrl } from "../lib/user";
import { createTRPCRouter, protectedAdminProcedure } from "../trpc";

interface AuthorizedPickupTokenPayload extends JWTPayload {
  sessionId: string;
  orderId: number;
}

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
          isTrustedContact: z.boolean(),
        }),
        z.object({
          authorized: z.literal(false),
          message: z.string(),
        }),
      ]),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        PICKUP_TOKEN_JWT_SECRET_KEY,
        PICKUP_TOKEN_ISSUER,
        PICKUP_TOKEN_AUDIENCE,
      } = process.env;

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
      // ensure order belongs to given session's user ID OR that the session's userId represents a trusted contact that was shared this order with
      const isOwner = order.customerId === payloadSession.userId;

      const orderShareRecord = await ctx.db.orderSharedAccess.findFirst({
        where: {
          orderId: order.id,
          sharedWithId: payloadSession.userId,
        },
        include: {
          sharedWith: true,
        },
      });

      const isShared = Boolean(orderShareRecord);

      if (!isOwner && !isShared) {
        console.error(
          `Given session's user ID ${payloadSession.userId} does not match the order's customer ID ${order.customerId} and it is NOT a trusted contact with shared access to order ${order.id}.`,
        );
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Session does not match order owner or trusted contact.",
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

      const {
        id: customerId,
        firstName,
        lastName,
        photoLink,
      } = isOwner ? order.customer : orderShareRecord!.sharedWith;

      if (!photoLink) {
        console.error(
          `Given session's user ID ${payloadSession.userId} attempted to pick up Order ID ${order.id}, but doesn't have portrait URL.`,
        );
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "User must upload a portrait before he or she can pick up a package.",
        });
      }

      return {
        authorized: true,
        orderId: order.id,
        customerId,
        portraitUrl: photoLink,
        firstName,
        lastName,
        isTrustedContact: isShared,
      };
    }),
});
