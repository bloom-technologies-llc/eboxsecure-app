import type { FileRouter } from "uploadthing/next";
import { createUploadthing } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  commentAttachment: f({
    "application/pdf": { maxFileSize: "64MB" },
    "image/png": { maxFileSize: "64MB" },
    "image/jpeg": { maxFileSize: "64MB" },
    "image/gif": { maxFileSize: "64MB" },
    "image/webp": { maxFileSize: "64MB" },
    "audio/mpeg": { maxFileSize: "64MB" },
  })
    .middleware(async ({ req }) => {
      // Here you could add authentication checks if needed
      return { userId: "user-id" }; // Return any metadata you want to pass to onUploadComplete
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
