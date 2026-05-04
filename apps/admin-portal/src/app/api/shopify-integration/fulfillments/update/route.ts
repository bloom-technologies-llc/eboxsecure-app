import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@ebox/db";

import { validateShopifyIntegrationKey } from "~/lib/shopify-integration-auth";

const FulfillmentUpdateSchema = z.object({
  shopifyOrderId: z.string(),
  trackingNumber: z.string().optional(),
  trackingCompany: z.string().optional(),
  trackingUrl: z.string().optional(),
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

  const parsed = FulfillmentUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // Find the order by shopifyOrderId
  const order = await db.order.findUnique({
    where: { shopifyOrderId: data.shopifyOrderId },
    select: { id: true, carrierId: true },
  });

  if (!order) {
    return NextResponse.json(
      { error: "Order not found for shopifyOrderId: " + data.shopifyOrderId },
      { status: 404 },
    );
  }

  // Resolve carrier by tracking company name if provided
  let carrierId = order.carrierId;
  if (data.trackingCompany && !carrierId) {
    const carrier = await db.carrier.findFirst({
      where: {
        name: { equals: data.trackingCompany, mode: "insensitive" },
      },
      select: { id: true },
    });
    carrierId = carrier?.id ?? null;
  }

  // Update the order with tracking info
  const updatedOrder = await db.order.update({
    where: { id: order.id },
    data: {
      trackingNumber: data.trackingNumber ?? undefined,
      carrierId: carrierId ?? undefined,
    },
  });

  return NextResponse.json({
    orderId: updatedOrder.id,
    trackingNumber: updatedOrder.trackingNumber,
    carrierId: updatedOrder.carrierId,
  });
}
