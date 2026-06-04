import type { Db, NormalizedFulfillment } from "./types";

export type FulfillmentResult =
  | { result: "updated"; orderId: number }
  | { result: "not-found" };

/**
 * Attach tracking from a fulfillment webhook to the matching `Order`.
 *
 * The `trackingNumber` it writes is the join key the already-merged scanner
 * reconciliation uses to mark a `SHOPIFY` Order processed/delivered on arrival.
 * Carrier is resolved by tracking-company name when we can match one; an
 * already-set carrier is left untouched. A fulfillment for an order we don't
 * have (e.g. a non-locker order) is a graceful no-op, not an error.
 */
export async function applyFulfillment(
  fulfillment: NormalizedFulfillment,
  deps: { db: Db },
): Promise<FulfillmentResult> {
  const { db } = deps;

  const order = await db.order.findUnique({
    where: { shopifyOrderId: fulfillment.shopifyOrderId },
    select: { id: true, carrierId: true },
  });
  if (!order) return { result: "not-found" };

  let carrierId = order.carrierId;
  if (fulfillment.trackingCompany && carrierId === null) {
    const carrier = await db.carrier.findFirst({
      where: { name: { equals: fulfillment.trackingCompany, mode: "insensitive" } },
      select: { id: true },
    });
    carrierId = carrier?.id ?? null;
  }

  const updated = await db.order.update({
    where: { id: order.id },
    data: {
      trackingNumber: fulfillment.trackingNumber ?? undefined,
      carrierId: carrierId ?? undefined,
    },
    select: { id: true },
  });

  return { result: "updated", orderId: updated.id };
}
