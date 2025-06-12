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
        photoLink: z.string().url(), // UploadThing URL
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

      // Save UploadThing URL to database
      await ctx.db.customerAccount.update({
        where: {
          id: link.customerId,
        },
        data: {
          photoLink: input.photoLink,
        },
      });

      await ctx.db.onboardingPhoneUploadLink.update({
        where: {
          customerId: link.customerId,
        },
        data: {
          completed: true,
        },
      });

      return { success: true };
    }),
  // logged in, but potentially no user created yet from webhook
  isOnboarded: protectedProcedure.query(async ({ ctx }) => {
    const customerAccount = await ctx.db.customerAccount.findUnique({
      where: {
        id: ctx.session.userId,
      },
      select: {
        photoLink: true,
      },
    });

    // User is onboarded if they have a photoLink (portrait photo uploaded)
    return !!customerAccount?.photoLink;
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

      const customerAccount = await ctx.db.customerAccount.findUnique({
        where: {
          id: link.customerId,
        },
        select: {
          photoLink: true,
        },
      });

      // User is onboarded if they have a photoLink (portrait photo uploaded)
      return !!customerAccount?.photoLink;
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
