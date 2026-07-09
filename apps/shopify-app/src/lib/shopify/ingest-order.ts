import type { Db, NormalizedOrder } from "./types";

export type IngestResult =
  | { result: "skipped" } // not a locker order (no/!malformed ebox metafield)
  | { result: "rejected"; reason: "unknown-customer" | "unknown-location" }
  | { result: "created"; orderId: number }
  | { result: "updated"; orderId: number };

/**
 * Create (or idempotently update) the EboxSecure `Order` for a locker checkout.
 *
 * Thin-adapter rules (ADR 0001):
 *  - Gate: skip unless the `ebox.eboxOrder` metafield is present — non-locker
 *    Shopify orders never enter EboxSecure.
 *  - Trust-but-validate: the metafield is written client-side, so the referenced
 *    `customerId` and `locationId` must exist before we create anything;
 *    tampered/stale values are rejected (not retried).
 *  - Deterministic linking: `shippedLocationId` comes straight from the
 *    metafield — no address fuzzy-matching, no favorite-location fallback.
 *  - Idempotent on `shopifyOrderId` so Shopify retries don't duplicate.
 */
export async function ingestEboxOrder(
  order: NormalizedOrder,
  deps: { db: Db },
): Promise<IngestResult> {
  const { db } = deps;

  if (!order.ebox) return { result: "skipped" };

  const { customerId, locationId } = order.ebox;

  const customer = await db.customerAccount.findUnique({
    where: { id: customerId },
    select: { id: true },
  });
  if (!customer) return { result: "rejected", reason: "unknown-customer" };

  const location = await db.location.findUnique({
    where: { id: locationId },
    select: { id: true },
  });
  if (!location) return { result: "rejected", reason: "unknown-location" };

  const existing = await db.order.findUnique({
    where: { shopifyOrderId: order.shopifyOrderId },
    select: { id: true },
  });

  if (existing) {
    const updated = await db.order.update({
      where: { id: existing.id },
      data: {
        total: order.total,
        shopifyShop: order.shopifyShop,
        shippedLocationId: locationId,
      },
      select: { id: true },
    });
    return { result: "updated", orderId: updated.id };
  }

  const created = await db.order.create({
    data: {
      customerId,
      vendorOrderId: order.orderName ?? `SHOPIFY_${order.shopifyOrderId}`,
      total: order.total,
      shippedLocationId: locationId,
      shopifyOrderId: order.shopifyOrderId,
      shopifyShop: order.shopifyShop,
      sourceChannel: "SHOPIFY",
      processedAt: null,
      ...(order.lineItems.length > 0 && {
        lineItems: {
          create: order.lineItems.map((li, index) => ({
            title: li.title,
            quantity: li.quantity,
            price: li.price,
            imageUrl: li.imageUrl,
            shopifyProductId: li.shopifyProductId,
            shopifyVariantId: li.shopifyVariantId,
            position: index,
          })),
        },
      }),
    },
    select: { id: true },
  });
  return { result: "created", orderId: created.id };
}
