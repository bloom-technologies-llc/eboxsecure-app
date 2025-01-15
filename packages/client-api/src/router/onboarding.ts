import { Readable } from "stream";
import type { TRPCRouterRecord } from "@trpc/server";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedCustomerProcedure, publicProcedure } from "../trpc";

const bucketName = "np-ebox-customer-data"; // TODO: don't hardcode nonprod bucket
export const onboardingRouter = {
  uploadPortraitFromAuthedClient: protectedCustomerProcedure
    .input(
      z.object({
        file: z.string(), // base64 representation
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const client = new S3Client({ region: "us-east-1" }); // TODO: get region from env
        const key = ctx.session.userId + "/" + "portrait.jpg";
        const { readableStream, bufferLength } = createReadStreamFromBase64(
          input.file,
        );
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
    }),
  uploadPortraitFromUnauthedClient: publicProcedure
    .input(
      z.object({
        file: z.string(), // base64 representation
        uploadKey: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      // TODO: validate upload key
    }),
} satisfies TRPCRouterRecord;

function createReadStreamFromBase64(base64Data: string) {
  // Strip off the Base64 metadata prefix, if it exists
  console.log("starting");
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
  console.log("returning");
  return { readableStream, bufferLength: buffer.length };
}
