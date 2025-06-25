import type { JWTPayload } from "jose";
import { TRPCError } from "@trpc/server";
import { EncryptJWT } from "jose";
import { z } from "zod";

import { createTRPCRouter, protectedCustomerProcedure } from "../trpc";

const {
  PICKUP_TOKEN_JWT_SECRET_KEY,
  PICKUP_TOKEN_ISSUER,
  PICKUP_TOKEN_AUDIENCE,
} = process.env;

// NOTE: must match the same in admin-api/auth.ts
interface AuthorizedPickupTokenPayload extends JWTPayload {
  sessionId: string;
  orderId: number;
}

// TODO: write unit tests for this
// TODO: support trusted contacts
export const authRouter = createTRPCRouter({
  getAuthorizedPickupToken: protectedCustomerProcedure
    .input(
      z.object({
        orderId: z.number().positive(),
      }),
    )
    .query(({ ctx, input }) => {
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

      const secret = Buffer.from(PICKUP_TOKEN_JWT_SECRET_KEY, "base64");
      const payload: AuthorizedPickupTokenPayload = {
        sessionId: ctx.session.sessionId,
        orderId: input.orderId,
      };
      const encryptedToken = new EncryptJWT(payload)
        .setProtectedHeader({ alg: "dir", enc: "A128CBC-HS256" })
        .setIssuedAt()
        .setIssuer(PICKUP_TOKEN_ISSUER)
        .setAudience(PICKUP_TOKEN_AUDIENCE)
        .setExpirationTime("1h") // TODO: Make 15 mins
        .encrypt(secret);

      return encryptedToken;
    }),
});
