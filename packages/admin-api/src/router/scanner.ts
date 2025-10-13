import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {Client} from "@googlemaps/google-maps-services-js";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import haversine from "haversine-distance";
import Stripe from "stripe";
import { getStripeCustomerId, hasValidSubscription } from "@ebox/stripe";

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
      })
    }),
  })
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
      'customer_not_found',
      'customer_not_subscribed'
    ])
  }),
]);

export const scannerRouter = createTRPCRouter({
  // TODO: have this proc only be inference, return values to populate as field in UI
  // then they can modify it if it's inaccurate, then resubmit to actually process the order
  inferShippingLabel: protectedProcedure
    .input(
      z.object({
        imageUrl: z.string(),
      }),
    )
    .output(InferShippingLabelOutputSchema)
    .mutation(async ({ input, ctx }) => {
      const { imageUrl } = input;
      const { location } = await ctx.db.employeeAccount.findUniqueOrThrow({
        where: {
          id: ctx.session.userId,
        },
        select: {
          location: {
            select: {
              address: true,
              id: true
            }
          }
        }
      })
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
        
        // Preprocess: ensure the recipient address matches this location
        const [recipientAddress, locationAddress] = await Promise.all([
          client.geocode({
            params: {
              address: parseResult.data.data.recipient.address.formatted_address,
              key: process.env.GOOGLE_GEOCODING_API_KEY!,
            },
          }),
          client.geocode({
            params: {
              address: location.address,
              key: process.env.GOOGLE_GEOCODING_API_KEY!,
            }
          })
        ])
        const recipientAddressData = recipientAddress.data.results[0]
        const locationAddressData = locationAddress.data.results[0]
        if (!recipientAddressData || !locationAddressData) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get address data from Google Maps API",
          });
        }
        const recipientFormattedAddress = recipientAddressData.formatted_address
        const locationFormattedAddress = locationAddressData.formatted_address
        const recipientDistance = haversine(recipientAddressData.geometry.location, locationAddressData.geometry.location)
        
        if (recipientFormattedAddress !== locationFormattedAddress && recipientDistance > 50) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Recipient address does not match location address.\nRecipient: " + recipientFormattedAddress + "\nLocation: " + locationFormattedAddress,
          });
        }
        


        
        const { tracking_number: trackingNumber, recipient } = parseResult.data.data
        const { name: recipientName, address } = recipient
        const { line2: recipientAddressLine2 } = address
        
        const names = recipientName.split(' ')
        // TODO: this isn't working. fix
        // Tracking number = Shopify, virtual address = manual
        let customer = await ctx.db.customerAccount.findFirst({
          where: {
                AND: [
                  {  firstName: { in: names, mode: "insensitive" } } ,
                  { lastName: { in: names, mode: "insensitive" } },
                  {
                    OR: [
                      { orders: { some: { trackingNumber } } },
              { virtualAddress: {
                equals: recipientAddressLine2,
                mode: "insensitive"
              } },
                    ]
                  }
                ] 
                
            
          },
          include: {
            orders: {
              where: {
                trackingNumber
              }
            }
          }
        })
        
        if (!customer) {
          return {
            status: 'error',
            reason: 'customer_not_found'
          }
        }

        // ensure customer is subscribed
        const stripeCustomerId = customer.stripeCustomerId
        if (!stripeCustomerId) {
          return {
            status: 'error',
            reason: 'customer_not_subscribed'
          }
        }
        const isValidSubscription = await hasValidSubscription(stripeCustomerId)
        if (!isValidSubscription) {
          return {
            status: 'error',
            reason: 'customer_not_subscribed'
          }
        }

        
        const now = new Date()
        let orderId = null
        // Create order if it doesn't exist
        if (customer.orders.length === 0) {
          // generate unique vendor order id
          let uniqueId = 'DEFAULT_' + customer.id + '_' + crypto.randomUUID()
          let isUnique = false
          while (!isUnique) {
            const order = await ctx.db.order.findFirst({ where: {vendorOrderId: uniqueId}})
            if (!order) {
              isUnique = true
            }
            else { uniqueId = 'DEFAULT_' + customer.id + '_' + crypto.randomUUID() }
          }

          
          const order =await ctx.db.order.create({
            data: {
              customerId: customer.id,
              trackingNumber,
              vendorOrderId: parseResult.data.data.order_number || uniqueId,
              total: -1,
              shippedLocationId: location.id,
              deliveredDate: now,
              processedAt: now,
              rawDeliveryJson: parseResult.data,
            }
          })
          orderId = order.id
        }
        // If it exists, update the order
        else {
          const order = customer.orders[0]
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
              rawDeliveryJson: parseResult.data,
            }
          })
          orderId = updatedOrder.id
        }
        
        // Charge customer
        // Send Stripe metering event
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

        const meterEvent = await stripe.billing.meterEvents.create({
          event_name: "package_allowance",
          payload: {
            value: '1',
            stripe_customer_id: stripeCustomerId,
          },
        });
        await ctx.db.meterEvent.create({
          data: {
            eventType: "PACKAGE_ALLOWANCE",
            value: 1,
            customerId: customer.id,
            orderId: orderId,
            stripeEventId: meterEvent.identifier
          },
        });

        return {
          status: 'success',
          data: {
            carrier: parseResult.data.data.provider_name,
            recipientName,
            virtualAddress: customer.virtualAddress,
            orderId: orderId.toString(),
          }
        }



      } catch (error) {
        console.error("PackageX inference error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process shipping label inference.",
        });
      }
    }),
});
