import { Readable } from "stream";
import {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import twilio from "twilio";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedCustomerProcedure,
  protectedProcedure,
  publicProcedure,
} from "../trpc";

export const onboardingRouter = createTRPCRouter({
  uploadPortraitFromAuthedClient: protectedCustomerProcedure
    .input(
      z.object({
        file: z.string(), // base64 representation
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await uploadPortraitToS3(input.file, ctx.session.userId);
    }),
  checkUploadStatus: protectedCustomerProcedure.query(async ({ ctx }) => {
    const linkKey = await ctx.db.onboardingPhoneUploadLink.findUnique({
      where: {
        customerId: ctx.session.userId,
      },
      select: {
        completed: true,
      },
    });
    return linkKey?.completed;
  }),
  createPhoneUploadLinkKey: protectedCustomerProcedure.mutation(
    async ({ ctx }) => {
      let linkKey = await ctx.db.onboardingPhoneUploadLink.findUnique({
        where: {
          customerId: ctx.session.userId,
        },
      });
      if (!linkKey) {
        linkKey = await ctx.db.onboardingPhoneUploadLink.create({
          data: {
            customerId: ctx.session.userId,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
          },
        });
      } else if (linkKey.expiresAt < new Date()) {
        await ctx.db.onboardingPhoneUploadLink.update({
          where: {
            id: linkKey.id,
          },
          data: {
            expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
          },
        });
      }

      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
      let baseUrl = process.env.VERCEL_URL;
      if (!accountSid || !authToken || !twilioPhoneNumber || !baseUrl) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Twilio credentials not found.",
        });
      }
      if (baseUrl.includes("localhost")) {
        baseUrl = "https://app-qa.eboxsecure.com";
      }
      // get user phone number
      const clerk = await clerkClient();
      const user = await clerk.users.getUser(ctx.session.userId);
      const phoneNumber = user.primaryPhoneNumber;
      if (!phoneNumber) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User phone number not found.",
        });
      }
      const url = `${baseUrl}/upload-onboarding-photo?uploadKey=${linkKey.id}`;
      const client = new twilio.Twilio(accountSid, authToken);
      await client.messages.create({
        to: phoneNumber.phoneNumber,
        from: twilioPhoneNumber,
        body: `Please proceed with the link below to upload your portrait photo to EboxSecure.\n${url}`,
      });
      console.log(
        `Sent sms from ${twilioPhoneNumber} to ${phoneNumber.phoneNumber}`,
      );
      return linkKey.id;
    },
  ),
  uploadPortraitFromUnauthedClient: publicProcedure
    .input(
      z.object({
        file: z.string(), // base64 representation
        uploadKey: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const link = await ctx.db.onboardingPhoneUploadLink.findUnique({
        where: {
          id: input.uploadKey,
        },
      });
      if (!link) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Invalid upload key.",
        });
      }

      if (new Date() > link.expiresAt) {
        await ctx.db.onboardingPhoneUploadLink.delete({
          where: {
            id: input.uploadKey,
          },
        });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Upload key expired. Please try again.",
        });
      }
      await uploadPortraitToS3(input.file, link.customerId);
      await ctx.db.onboardingPhoneUploadLink.update({
        where: {
          customerId: link.customerId,
        },
        data: {
          completed: true,
        },
      });
    }),
  // logged in, but potentially no user created yet from webhook
  isOnboarded: protectedProcedure.query(async ({ ctx }) => {
    const isOnboarded = await checkIfPortraitExists(ctx.session.userId);
    return isOnboarded;
  }),
  isOnboardedUnauthed: publicProcedure
    .input(z.object({ uploadKey: z.string() }))
    .query(async ({ input, ctx }) => {
      const link = await ctx.db.onboardingPhoneUploadLink.findUnique({
        where: {
          id: input.uploadKey,
        },
        select: {
          customerId: true,
        },
      });
      if (!link) return false;
      const isOnboarded = await checkIfPortraitExists(link.customerId);
      return isOnboarded;
    }),
  isUploadKeyValid: publicProcedure
    .input(z.object({ uploadKey: z.string() }))
    .query(async ({ input, ctx }) => {
      const link = await ctx.db.onboardingPhoneUploadLink.findUnique({
        where: {
          id: input.uploadKey,
        },
      });
      if (!link) {
        console.error(`Upload key ${input.uploadKey} not found.`);
        return false;
      }
      if (new Date() > link.expiresAt) {
        await ctx.db.onboardingPhoneUploadLink.delete({
          where: {
            id: input.uploadKey,
          },
        });
        console.error(`Upload key ${input.uploadKey} expired.`);
        return false;
      }
      return true;
    }),
});

function createReadStreamFromBase64(base64Data: string) {
  // Strip off the Base64 metadata prefix, if it exists
  const base64String = base64Data.split(",")[1];
  if (!base64String) {
    throw new Error("Invalid Base64 data");
  }
  // Convert the Base64 string to a Buffer
  const buffer = Buffer.from(base64String, "base64");
  // Create a readable stream from the buffer
  const readableStream = new Readable();
  readableStream.push(buffer);
  readableStream.push(null); // Signal the end of the stream
  return { readableStream, bufferLength: buffer.length };
}

async function uploadPortraitToS3(file: string, userId: string) {
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
    const key = userId + "/" + "portrait.jpg";
    const { readableStream, bufferLength } = createReadStreamFromBase64(file);
    const uploadCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: readableStream,
      ContentLength: bufferLength,
    });
    await client.send(uploadCommand);
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

async function checkIfPortraitExists(userId: string) {
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
    const headCommand = new HeadObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await client.send(headCommand);
    return true; // File exists
  } catch (error) {
    if (error instanceof Error && error.name === "NotFound") {
      return false; // File does not exist
    }
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
