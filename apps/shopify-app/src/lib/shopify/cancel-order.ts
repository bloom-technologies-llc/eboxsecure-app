import type { Db, NormalizedCancellation } from "./types";

export type CancelResult =
  | { result: "cancelled"; orderId: number }
  | { result: "not-found" };

/**
 * Reflect a Shopify cancellation on the matching `Order` by stamping
 * `cancelledAt`/`cancelReason`. The Order is never deleted — it stays as our
 * own record that the package isn't coming. Cancelling an order we don't have
 * is a graceful no-op.
 */
export async function cancelEboxOrder(
  cancellation: NormalizedCancellation,
  deps: { db: Db },
): Promise<CancelResult> {
  const { db } = deps;

  const order = await db.order.findUnique({
    where: { shopifyOrderId: cancellation.shopifyOrderId },
    select: { id: true },
  });
  if (!order) return { result: "not-found" };

  const updated = await db.order.update({
    where: { id: order.id },
    data: {
      cancelledAt: new Date(),
      cancelReason: cancellation.cancelReason,
    },
    select: { id: true },
  });

  return { result: "cancelled", orderId: updated.id };
}
