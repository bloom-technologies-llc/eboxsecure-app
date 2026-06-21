import { createHmac, timingSafeEqual } from "node:crypto";

import type { Db } from "./types";

/**
 * Verify the `X-Shopify-Hmac-Sha256` header against the raw request body.
 *
 * The comparison is constant-time. The raw body (exact bytes Shopify sent) must
 * be used — any re-serialization changes the digest. Returns false on a missing
 * header or any length/format mismatch rather than throwing.
 */
export function verifyHmac(
  rawBody: string | Buffer,
  hmacHeader: string | null | undefined,
  secret: string,
): boolean {
  if (!hmacHeader || !secret) return false;

  const digest = createHmac("sha256", secret)
    .update(typeof rawBody === "string" ? Buffer.from(rawBody, "utf8") : rawBody)
    .digest();

  let provided: Buffer;
  try {
    provided = Buffer.from(hmacHeader, "base64");
  } catch {
    return false;
  }

  // timingSafeEqual throws on differing lengths, so guard first.
  if (provided.length !== digest.length) return false;
  return timingSafeEqual(provided, digest);
}

/**
 * Has this webhook event id already been processed? Deduplicates Shopify
 * retries so a redelivered event isn't double-processed.
 */
export async function isDuplicate(
  webhookEventId: string,
  deps: { db: Db },
): Promise<boolean> {
  const existing = await deps.db.shopifyWebhookEvent.findUnique({
    where: { webhookEventId },
    select: { id: true },
  });
  return existing !== null;
}

/**
 * Record a successfully-processed webhook event for future dedupe. Called only
 * after the handler succeeds, so a failed handler (which returns non-2xx and is
 * retried by Shopify) is not recorded as seen.
 */
export async function recordWebhookEvent(
  event: { webhookEventId: string; topic: string; shop: string },
  deps: { db: Db },
): Promise<void> {
  await deps.db.shopifyWebhookEvent.create({ data: event });
}
