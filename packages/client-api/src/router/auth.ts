import type { JWTPayload } from "jose";
import { TRPCError } from "@trpc/server";
import { EncryptJWT } from "jose";
import { z } from "zod";

import { createTRPCRouter, protectedCustomerProcedure } from "../trpc";

const SUBJECT = "eboxsecure-authorized-pickup";
const AUDIENCE = "ebox-client";
const ISSUER = "eboxsecure-api";

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
      if (!process.env.JWT_SECRET_KEY) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Please add JWT_SECRET_KEY from Clerk Dashboard to environment variables",
        });
      }
      const secret = Buffer.from(process.env.JWT_SECRET_KEY, "base64");
      const payload: AuthorizedPickupTokenPayload = {
        sessionId: ctx.session.sessionId,
        orderId: input.orderId,
      };
      const encryptedToken = new EncryptJWT(payload)
        .setProtectedHeader({ alg: "dir", enc: "A128CBC-HS256" })
        .setSubject(SUBJECT)
        .setIssuedAt()
        .setIssuer(ISSUER)
        .setAudience(AUDIENCE)
        .setExpirationTime("1h")
        .encrypt(secret);

      return encryptedToken;
    }),
});
