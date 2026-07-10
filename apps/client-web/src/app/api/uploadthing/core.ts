import type { FileRouter } from "uploadthing/next";
import { getAuth } from "@clerk/nextjs/server";
import { createUploadthing } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";

import { db } from "@ebox/db";

const f = createUploadthing();

export const ourFileRouter = {
  portraitUpload: f({
    "image/jpeg": { maxFileSize: "4MB" },
    "image/png": { maxFileSize: "4MB" },
    "image/webp": { maxFileSize: "4MB" },
  })
    .middleware(async ({ req }) => {
      // Get the authenticated user from Clerk
      const { userId } = getAuth(req);

      if (!userId) {
        throw new UploadThingError(
          "Unauthorized - must be logged in to upload portrait photo",
        );
      }

      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Portrait upload complete for user:", metadata.userId);
      console.log("File URL:", file.ufsUrl);

      try {
        // Save the uploaded image URL directly to the database
        await db.customerAccount.update({
          where: {
            id: metadata.userId,
          },
          data: {
            photoLink: file.ufsUrl,
          },
        });

        console.log("Successfully saved portrait photo URL to database");
      } catch (error) {
        console.error("Failed to save portrait photo URL to database:", error);
        throw new UploadThingError("Failed to save photo to user account");
      }

      return { uploadedBy: metadata.userId, fileUrl: file.ufsUrl };
    }),

  // Unauthenticated variant used by the mobile phone-upload flow. There is no
  // Clerk session here, so the caller is authorized by the one-time uploadKey
  // (an OnboardingPhoneUploadLink) delivered over SMS. Unlike portraitUpload we
  // do NOT save here: the client sends the resulting URL to the
  // onboarding.uploadPortraitFromUnauthedClient mutation, which resolves the
  // customer from the uploadKey, saves photoLink, and marks the link completed.
  phonePortraitUpload: f({
    "image/jpeg": { maxFileSize: "4MB" },
    "image/png": { maxFileSize: "4MB" },
    "image/webp": { maxFileSize: "4MB" },
  })
    .input(z.object({ uploadKey: z.string() }))
    .middleware(async ({ input }) => {
      const link = await db.onboardingPhoneUploadLink.findUnique({
        where: { id: input.uploadKey },
      });

      if (!link) {
        throw new UploadThingError("Invalid upload link.");
      }
      if (new Date() > link.expiresAt) {
        throw new UploadThingError("Upload link expired. Please try again.");
      }

      return { uploadKey: input.uploadKey };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Intentionally no DB write here — see comment above.
      console.log(
        "Phone portrait upload complete for uploadKey:",
        metadata.uploadKey,
        file.ufsUrl,
      );
      return { fileUrl: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
