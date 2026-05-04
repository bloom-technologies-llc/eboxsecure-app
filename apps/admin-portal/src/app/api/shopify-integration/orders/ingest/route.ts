import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@ebox/db";

import { validateShopifyIntegrationKey } from "~/lib/shopify-integration-auth";

const OrderIngestSchema = z.object({
  shopifyOrderId: z.string(),
  shopifyShop: z.string(),
  orderName: z.string().optional(),
  email: z.string().email(),
  total: z.number().default(0),
  trackingNumber: z.string().optional(),
  shippingAddress: z
    .object({
      address1: z.string().optional(),
      city: z.string().optional(),
      zip: z.string().optional(),
      provinceCode: z.string().optional(),
      countryCode: z.string().optional(),
    })
    .optional(),
  lineItems: z
    .array(
      z.object({
        title: z.string(),
        quantity: z.number(),
        price: z.number(),
        sku: z.string().optional(),
        productId: z.string().optional(),
      }),
    )
    .optional(),
});

export async function POST(request: Request) {
  const authError = validateShopifyIntegrationKey(request);
  if (authError) return authError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = OrderIngestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // Find the customer by email
  const customer = await db.customerAccount.findFirst({
    where: { email: { equals: data.email, mode: "insensitive" } },
    select: { id: true },
  });

  if (!customer) {
    return NextResponse.json(
      { error: "Customer not found for email: " + data.email },
      { status: 404 },
    );
  }

  // Resolve shippedLocationId by matching the shipping address to a location
  let shippedLocationId: number | null = null;

  if (data.shippingAddress) {
    const addr = data.shippingAddress;
    // Try exact match on structured address fields first
    if (addr.address1) {
      const location = await db.location.findFirst({
        where: {
          OR: [
            {
              address1: { equals: addr.address1, mode: "insensitive" },
              city: addr.city
                ? { equals: addr.city, mode: "insensitive" }
                : undefined,
            },
            {
              address: {
                contains: addr.address1,
                mode: "insensitive",
              },
            },
          ],
        },
        select: { id: true },
      });
      shippedLocationId = location?.id ?? null;
    }
  }

  if (!shippedLocationId) {
    // Fall back to first favorited location for this customer
    const favorite = await db.userFavoriteLocation.findFirst({
      where: { userId: customer.id, isPrimary: true },
      select: { locationId: true },
    });
    if (!favorite) {
      // Try any favorited location
      const anyFavorite = await db.userFavoriteLocation.findFirst({
        where: { userId: customer.id },
        select: { locationId: true },
      });
      shippedLocationId = anyFavorite?.locationId ?? null;
    } else {
      shippedLocationId = favorite.locationId;
    }
  }

  if (!shippedLocationId) {
    return NextResponse.json(
      { error: "Could not resolve a location for this order" },
      { status: 400 },
    );
  }

  // Upsert the order by shopifyOrderId
  const order = await db.order.upsert({
    where: { shopifyOrderId: data.shopifyOrderId },
    create: {
      customerId: customer.id,
      vendorOrderId: data.orderName ?? `SHOPIFY_${data.shopifyOrderId}`,
      total: data.total,
      shippedLocationId,
      shopifyOrderId: data.shopifyOrderId,
      shopifyShop: data.shopifyShop,
      sourceChannel: "SHOPIFY",
      trackingNumber: data.trackingNumber ?? null,
    },
    update: {
      total: data.total,
      trackingNumber: data.trackingNumber ?? undefined,
      shopifyShop: data.shopifyShop,
    },
  });

  return NextResponse.json({
    orderId: order.id,
    shopifyOrderId: order.shopifyOrderId,
    created: order.createdAt.toISOString() === order.updatedAt.toISOString(),
  });
}
