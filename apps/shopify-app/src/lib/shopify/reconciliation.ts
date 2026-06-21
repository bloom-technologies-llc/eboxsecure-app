import type { Db } from "./types";

/**
 * Hours after creation that a still-unprocessed `SHOPIFY` Order is considered
 * stale and in need of ops attention.
 */
export const DEFAULT_STALE_AFTER_HOURS = 48;

export interface UnmatchedShopifyOrder {
  id: number;
  shopifyOrderId: string | null;
  shopifyShop: string | null;
  trackingNumber: string | null;
  createdAt: Date;
  processedAt: Date | null;
}

/**
 * Surface `SHOPIFY` Orders that can't be matched to a Scan, so ops reconcile
 * them rather than let a package be silently duplicated as a `SCAN` Order.
 *
 * "Needs reconciliation" means an active (not cancelled, not picked up)
 * `SHOPIFY` Order that is either:
 *   - missing a tracking number (no Scan join key — e.g. the merchant fulfilled
 *     without tracking), or
 *   - still unprocessed (`processedAt` null) more than `staleAfterHours` after
 *     creation (arrived but never matched, or never arrived).
 *
 * No Order is created or mutated here — this is read-only visibility.
 */
export async function findUnmatchedShopifyOrders(
  deps: { db: Db },
  opts: { now?: Date; staleAfterHours?: number } = {},
): Promise<UnmatchedShopifyOrder[]> {
  const now = opts.now ?? new Date();
  const staleAfterHours = opts.staleAfterHours ?? DEFAULT_STALE_AFTER_HOURS;
  const staleBefore = new Date(now.getTime() - staleAfterHours * 60 * 60 * 1000);

  return deps.db.order.findMany({
    where: {
      sourceChannel: "SHOPIFY",
      cancelledAt: null,
      pickedUpAt: null,
      OR: [
        { trackingNumber: null },
        { AND: [{ processedAt: null }, { createdAt: { lt: staleBefore } }] },
      ],
    },
    select: {
      id: true,
      shopifyOrderId: true,
      shopifyShop: true,
      trackingNumber: true,
      createdAt: true,
      processedAt: true,
    },
    orderBy: { createdAt: "asc" },
  });
}
