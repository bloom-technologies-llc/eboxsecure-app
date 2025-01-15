import type { TRPCRouterRecord } from "@trpc/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { jwtDecrypt } from "jose";
import { z } from "zod";

import { protectedCorporateProcedure } from "../trpc";

const SUBJECT = "eboxsecure-authorized-pickup";
const AUDIENCE = "ebox-client";
const ISSUER = "eboxsecure-api";

interface Payload {
  sessionId: string;
  orderId: number;
}

// TODO: write unit tests for this
export const authRouter = {
  authenticateAuthorizedPickupToken: protectedCorporateProcedure
    .input(
      z.object({
        pickupToken: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!process.env.JWT_SECRET_KEY) {
        throw new Error(
          "Please add JWT_SECRET_KEY from Clerk Dashboard to environment variables",
        );
      }

      try {
        const secret = Buffer.from(process.env.JWT_SECRET_KEY, "base64");
        const { payload } = await jwtDecrypt<Payload>(
          input.pickupToken,
          secret,
          {
            issuer: ISSUER,
            audience: AUDIENCE,
            subject: SUBJECT,
          },
        );
        try {
          // ensure valid session ID
          const payloadSession = await clerkClient.sessions.getSession(
            payload.sessionId,
          );
          // ensure valid order ID
          const order = await ctx.db.order.findUnique({
            where: {
              id: payload.orderId,
            },
          });
          if (!order) {
            ctx.log.error(`Order ID ${payload.orderId} not found in database.`);
            return false;
          }
          // ensure order belongs to given session's user ID
          if (order.customerId !== payloadSession.userId) {
            ctx.log.error(
              `Given session's user ID ${payloadSession.userId} does not match order's customer ID ${order.customerId}.`,
            );
            return false;
          }
          return true;
        } catch (error) {
          ctx.log.error(
            `Unable to find session of given ID in pickupToken: ${error}`,
          );
          return false;
        }
      } catch (error) {
        ctx.log.error(`Unable to decrypt pickupToken: ${error}`);
        return false;
      }
    }),
} satisfies TRPCRouterRecord;
