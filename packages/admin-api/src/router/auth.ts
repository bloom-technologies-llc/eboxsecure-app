import type { JWTPayload } from "jose";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { TRPCError } from "@trpc/server";
import { jwtDecrypt } from "jose";
import { z } from "zod";

import { createTRPCRouter, protectedCorporateProcedure } from "../trpc";

const SUBJECT = "eboxsecure-authorized-pickup";
const AUDIENCE = "ebox-client";
const ISSUER = "eboxsecure-api";

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
        const { payload } = await jwtDecrypt<AuthorizedPickupTokenPayload>(
          input.pickupToken,
          secret,
          {
            issuer: ISSUER,
            audience: AUDIENCE,
            subject: SUBJECT,
          },
        );

        // ensure valid session ID
        const payloadSession = await ctx.db.session.findUnique({
          where: {
            id: payload.sessionId,
          },
        });
        if (!payloadSession) {
          ctx.log.error(
            `Session ID ${payload.sessionId} not found in database as valid session.`,
          );
          return { authorized: false };
        }
        if (payloadSession.status !== "ACTIVE") {
          ctx.log.error(`Session ID ${payload.sessionId} is not active.`);
          return { authorized: false };
        }
        // ensure valid order ID
        const order = await ctx.db.order.findUnique({
          where: {
            id: payload.orderId,
          },
        });
        if (!order) {
          ctx.log.error(`Order ID ${payload.orderId} not found in database.`);
          return { authorized: false };
        }
        // ensure order belongs to given session's user ID
        if (order.customerId !== payloadSession.userId) {
          ctx.log.error(
            `Given session's user ID ${payloadSession.userId} does not match order's customer ID ${order.customerId}.`,
          );
          return { authorized: false };
        }

        // fetch portrait
        const url = await getPortraitSignedUrl(payloadSession.userId);
        return { authorized: true, url };
      } catch (error) {
        ctx.log.error(`Unable to decrypt pickupToken: ${error}`);
        return { authorized: false };
      }
    }),
});

async function getPortraitSignedUrl(userId: string) {
  const region = process.env.AWS_REGION;
  if (!region) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "AWS_REGION not found.",
    });
  }

  const nodeEnv = process.env.VERCEL_ENV ?? process.env.NODE_ENV;
  const bucketName =
    nodeEnv === "production"
      ? "prod-ebox-customer-data"
      : "np-ebox-customer-data";

  try {
    const client = new S3Client({ region });
    const key = `${userId}/portrait.jpg`;

    const url = await getSignedUrl(
      client,
      new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      }),
      { expiresIn: 3600 }, // URL valid for 1 hour
    );

    return url;
  } catch (error) {
    if (error instanceof Error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      });
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "An unknown error occurred.",
    });
  }
}
