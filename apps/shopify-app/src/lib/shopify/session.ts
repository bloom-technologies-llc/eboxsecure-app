import type { Db } from "./types";

/**
 * Session adapter over the `ShopifySession` Prisma model. The merchant OAuth
 * flow stores exactly one *offline* session per shop; these helpers are the
 * only writers/readers of that row outside the compliance/uninstall handlers
 * (which delete by `shop` — see `compliance.ts`). DB is injected so the adapter
 * unit-tests against a mocked Prisma client.
 */

export interface ShopifyOfflineSession {
  shop: string;
  /**
   * Legacy OAuth CSRF nonce. Meaningless under managed-installation token
   * exchange, so optional now; persisted as "" to satisfy the column.
   */
  state?: string;
  scope: string;
  accessToken: string;
  /** Offline tokens don't expire; present for parity with the column. */
  expires?: Date | null;
}

/** Deterministic primary key for a shop's offline session (mirrors Shopify's convention). */
export function offlineSessionId(shop: string): string {
  return `offline_${shop}`;
}

/**
 * Upsert the offline session for a shop. Keyed by the deterministic
 * `offline_{shop}` id so re-installing (or a scope change) overwrites rather
 * than accumulating stale rows. `isOnline` is always false here — this app only
 * uses offline tokens for its webhook/background work.
 */
export async function storeSession(
  session: ShopifyOfflineSession,
  deps: { db: Db },
): Promise<void> {
  const id = offlineSessionId(session.shop);
  const data = {
    shop: session.shop,
    state: session.state ?? "",
    isOnline: false,
    scope: session.scope,
    expires: session.expires ?? null,
    accessToken: session.accessToken,
  };

  await deps.db.shopifySession.upsert({
    where: { id },
    create: { id, ...data },
    update: data,
  });
}

/**
 * Load the most recent offline session for a shop, or null if the shop has
 * never completed install. Offline-only, so online sessions are excluded.
 */
export async function loadSessionByShop(
  shop: string,
  deps: { db: Db },
): Promise<{
  id: string;
  shop: string;
  scope: string | null;
  accessToken: string;
  state: string;
} | null> {
  const row = await deps.db.shopifySession.findFirst({
    where: { shop, isOnline: false },
    orderBy: { id: "desc" },
    select: {
      id: true,
      shop: true,
      scope: true,
      accessToken: true,
      state: true,
    },
  });
  return row;
}

/**
 * Delete every session for a shop. Deletes by `shop` (not id) to stay
 * consistent with the compliance/uninstall handlers, so a redaction and a
 * client-initiated disconnect clear the same rows.
 */
export async function deleteSessionsForShop(
  shop: string,
  deps: { db: Db },
): Promise<{ sessionsDeleted: number }> {
  const res = await deps.db.shopifySession.deleteMany({ where: { shop } });
  return { sessionsDeleted: res.count };
}
