import { Client } from "@googlemaps/google-maps-services-js";
import { TRPCError } from "@trpc/server";
import haversine from "haversine-distance";
import Stripe from "stripe";
import { z } from "zod";

import { NotificationService } from "@ebox/notifications";
import { hasValidSubscription } from "@ebox/stripe";

import { createTRPCRouter, protectedEmployeeProcedure } from "../trpc";

const client = new Client({});

const PackageXInferenceSchema = z.object({
  status: z.number(),
  message: z.string(),
  errors: z.array(z.string()),
  data: z.object({
    tracking_number: z.string(),
    order_number: z.string().nullable(),
    raw_text: z.string(),
    extracted_recipient_name: z.string(),
    provider_name: z.string(),
    provider_id: z.string(),
    status: z.string(),
    errors: z.array(z.string()),
    exceptions: z.object({
      unknown_contact: z.boolean(),
      addressed_generically: z.boolean(),
      damaged_label: z.boolean(),
      arrived_opened: z.boolean(),
      suspicious: z.boolean(),
      missing_label: z.boolean(),
    }),
    recipient: z.object({
      name: z.string(),
      business: z.string().nullable(),
      email: z.string().nullable(),
      phone: z.string().nullable(),
      address: z.object({
        line1: z.string(),
        line2: z.string().nullable(),
        city: z.string(),
        state: z.string(),
        state_code: z.string(),
        postal_code: z.string(),
        country: z.string(),
        country_code: z.string(),
        formatted_address: z.string(),
      }),
    }),
  }),
});

const InferShippingLabelOutputSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("success"),
    data: z.object({
      recipientName: z.string(),
      virtualAddress: z.string().nullable(),
      orderId: z.string(),
    }),
  }),
  z.object({
    status: z.literal("error"),
    reason: z.enum([
      "customer_not_found",
      "customer_not_subscribed",
      "missing_identifier",
      "order_already_processed",
      "location_not_favorited",
    ]),
  }),
]);

export const scannerRouter = createTRPCRouter({
  inferShippingLabel: protectedEmployeeProcedure
    .input(
      z.object({
        imageUrl: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { imageUrl } = input;

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
            }),
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `PackageX API error: ${response.status}. ${response.statusText}. ${errorText}`,
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

        return {
          recipientName: parseResult.data.data.recipient.name,
          formattedAddress:
            parseResult.data.data.recipient.address.formatted_address,
          rawDeliveryJson: JSON.stringify(data),
          virtualAddress: parseResult.data.data.recipient.address.line2,
          trackingNumber: parseResult.data.data.tracking_number,
          vendorOrderId: parseResult.data.data.order_number,
        };
      } catch (error) {
        console.error("PackageX inference error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process shipping label inference.",
        });
      }
    }),
  processPackage: protectedEmployeeProcedure
    .input(
      z.object({
        recipientName: z.string(),
        formattedAddress: z.string(),
        rawDeliveryJson: z.string(),
        trackingNumber: z.string(),
        virtualAddress: z.string().optional(),
        vendorOrderId: z.string().optional(),
      }),
    )
    .output(InferShippingLabelOutputSchema)
    .mutation(async ({ input, ctx }) => {
      const {
        recipientName,
        formattedAddress,
        virtualAddress,
        trackingNumber,
        rawDeliveryJson,
        vendorOrderId,
      } = input;
      const { location } = await ctx.db.employeeAccount.findUniqueOrThrow({
        where: {
          id: ctx.session.userId,
        },
        select: {
          location: {
            select: {
              address: true,
              id: true,
            },
          },
        },
      });

      // Preprocess: ensure the recipient address matches this location
      const [recipientAddress, locationAddress] = await Promise.all([
        client.geocode({
          params: {
            address: formattedAddress,
            key: process.env.GOOGLE_GEOCODING_API_KEY!,
          },
        }),
        client.geocode({
          params: {
            address: location.address,
            key: process.env.GOOGLE_GEOCODING_API_KEY!,
          },
        }),
      ]);
      const recipientAddressData = recipientAddress.data.results[0];
      const locationAddressData = locationAddress.data.results[0];
      if (!recipientAddressData || !locationAddressData) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get address data from Google Maps API",
        });
      }
      const recipientFormattedAddress = recipientAddressData.formatted_address;
      const locationFormattedAddress = locationAddressData.formatted_address;
      const recipientDistance = haversine(
        recipientAddressData.geometry.location,
        locationAddressData.geometry.location,
      );

      if (
        recipientFormattedAddress !== locationFormattedAddress &&
        recipientDistance > 50
      ) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Recipient address does not match location address.\nRecipient: " +
            recipientFormattedAddress +
            "\nLocation: " +
            locationFormattedAddress,
        });
      }

      const names = recipientName.split(" ");
      // Tracking number = Shopify, virtual address = manual
      // Build OR conditions based on available data
      const orConditions: any[] = [{ orders: { some: { trackingNumber } } }];
      if (virtualAddress) {
        orConditions.push({
          virtualAddress: {
            equals: virtualAddress,
            mode: "insensitive",
          },
        });
      }

      // Ensure at least one identifier is provided
      if (orConditions.length === 0) {
        return {
          status: "error",
          reason: "missing_identifier",
        };
      }
      let customer = await ctx.db.customerAccount.findFirst({
        where: {
          AND: [
            { firstName: { in: names, mode: "insensitive" } },
            { lastName: { in: names, mode: "insensitive" } },
            ...(orConditions.length > 0 ? [{ OR: orConditions }] : []),
          ],
        },
        include: {
          orders: trackingNumber ? { where: { trackingNumber } } : { take: 0 },
        },
      });

      if (!customer) {
        return {
          status: "error",
          reason: "customer_not_found",
        };
      }

      // ensure customer is subscribed
      const stripeCustomerId = customer.stripeCustomerId;
      if (!stripeCustomerId) {
        return {
          status: "error",
          reason: "customer_not_subscribed",
        };
      }
      const isValidSubscription = await hasValidSubscription(stripeCustomerId);
      if (!isValidSubscription) {
        return {
          status: "error",
          reason: "customer_not_subscribed",
        };
      }

      // Check if order has already been processed
      const existingOrder = await ctx.db.order.findFirst({
        where: {
          customerId: customer.id,
          trackingNumber: trackingNumber,
        },
      });
      if (existingOrder) {
        if (existingOrder.processedAt || existingOrder.deliveredDate) {
          return {
            status: "error",
            reason: "order_already_processed",
          };
        }
      }

      // Check if customer has this location favorited
      const isLocationFavorited = await ctx.db.userFavoriteLocation.findUnique({
        where: {
          userId_locationId: {
            userId: customer.id,
            locationId: location.id,
          },
        },
      });
      if (!isLocationFavorited) {
        return {
          status: "error",
          reason: "location_not_favorited",
        };
      }

      const now = new Date();
      let orderId = null;

      // Check for a pre-created Shopify order matching this tracking number
      const shopifyOrder = await ctx.db.order.findFirst({
        where: {
          trackingNumber,
          sourceChannel: "SHOPIFY",
          processedAt: null,
        },
      });

      if (shopifyOrder) {
        // Shopify-originated order: mark as delivered/processed
        const updatedOrder = await ctx.db.order.update({
          where: { id: shopifyOrder.id },
          data: {
            deliveredDate: now,
            processedAt: now,
            rawDeliveryJson: rawDeliveryJson,
            shippedLocationId: location.id,
          },
        });
        orderId = updatedOrder.id;
      } else if (customer.orders.length === 0) {
        // No existing order — create a new scan-originated order
        // generate unique vendor order id
        let uniqueId = "DEFAULT_" + customer.id + "_" + crypto.randomUUID();
        let isUnique = false;
        while (!isUnique) {
          const order = await ctx.db.order.findFirst({
            where: { vendorOrderId: uniqueId },
          });
          if (!order) {
            isUnique = true;
          } else {
            uniqueId = "DEFAULT_" + customer.id + "_" + crypto.randomUUID();
          }
        }

        const order = await ctx.db.order.create({
          data: {
            customerId: customer.id,
            trackingNumber,
            vendorOrderId: vendorOrderId || uniqueId,
            total: -1,
            shippedLocationId: location.id,
            deliveredDate: now,
            processedAt: now,
            rawDeliveryJson: rawDeliveryJson,
            sourceChannel: "SCAN",
          },
        });
        orderId = order.id;
      }
      // If it exists, update the order
      else {
        const order = customer.orders[0];
        if (!order) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Order not found in unexpected state",
          });
        }
        const updatedOrder = await ctx.db.order.update({
          where: {
            id: order.id,
          },
          data: {
            deliveredDate: now,
            processedAt: now,
            rawDeliveryJson: rawDeliveryJson,
          },
        });
        orderId = updatedOrder.id;
      }

      // Charge customer
      // Send Stripe metering event
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

      const meterEvent = await stripe.billing.meterEvents.create({
        event_name: "package_allowance",
        payload: {
          value: "1",
          stripe_customer_id: stripeCustomerId,
        },
      });
      await ctx.db.meterEvent.create({
        data: {
          eventType: "PACKAGE_ALLOWANCE",
          value: 1,
          customerId: customer.id,
          orderId: orderId,
          stripeEventId: meterEvent.identifier,
        },
      });

      // Send delivery notification to customer
      const notificationService = new NotificationService(ctx.db);
      await notificationService.send({
        userId: customer.id,
        type: "ORDER_DELIVERED",
        message: `Your package has been delivered to ${location.address}.`,
        orderId: orderId,
      });

      return {
        status: "success",
        data: {
          recipientName,
          virtualAddress: customer.virtualAddress,
          orderId: orderId.toString(),
        },
      };
    }),
});
