import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

// Zod schema for PackageX API response
const PackageXInferenceSchema = z.object({
  data: z.object({
    id: z.string(),
    status: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    image_url: z.string().optional(),
    tracking_number: z.string().optional(),
    carrier: z.string().optional(),
    service: z.string().optional(),
    weight: z
      .object({
        value: z.number(),
        unit: z.string(),
      })
      .optional(),
    dimensions: z
      .object({
        length: z.number(),
        width: z.number(),
        height: z.number(),
        unit: z.string(),
      })
      .optional(),
    sender: z
      .object({
        name: z.string().optional(),
        company: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        postal_code: z.string().optional(),
        country: z.string().optional(),
      })
      .optional(),
    recipient: z
      .object({
        name: z.string().optional(),
        company: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        postal_code: z.string().optional(),
        country: z.string().optional(),
      })
      .optional(),
    barcode_values: z.array(z.string()).optional(),
    exceptions: z.array(z.string()).optional(),
    confidence_score: z.number().optional(),
  }),
  success: z.boolean(),
  message: z.string().optional(),
});

export const scannerRouter = createTRPCRouter({
  inferShippingLabel: protectedProcedure
    .input(
      z.object({
        imageUrl: z.string(),
        locationId: z.string().optional(),
        layoutId: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { imageUrl, locationId, layoutId } = input;

      try {
        const response = await fetch(
          "https://api.packagex.io/v1/inferences/images/shipping-labels",
          {
            method: "POST",
            headers: {
              "PX-API-KEY": process.env.PACKAGEX_API_KEY!,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              image_url: imageUrl,
              location_id: locationId,
              layout_id: layoutId,
              options: {
                postprocess: {
                  parse_addresses: ["recipient"],
                },
              },
            }),
          },
        );

        if (!response.ok) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `PackageX API error: ${response.status}`,
          });
        }

        const data = await response.json();
        console.log("PackageX response:", JSON.stringify(data, null, 2));
        // Validate and parse the response using Zod schema
        const parseResult = PackageXInferenceSchema.safeParse(data);

        if (!parseResult.success) {
          console.error(
            "PackageX response validation failed:",
            parseResult.error,
          );
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Invalid response format from PackageX API",
          });
        }

        return parseResult.data;
      } catch (error) {
        console.error("PackageX inference error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process shipping label inference.",
        });
      }
    }),
});
