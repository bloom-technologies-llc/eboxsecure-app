import { NextResponse } from "next/server";

import { db } from "@ebox/db";

import { env } from "~/env";
import { applyFulfillment } from "~/lib/shopify/apply-fulfillment";
import { cancelEboxOrder } from "~/lib/shopify/cancel-order";
import {
  deleteShopSession,
  recordDataRequest,
  redactCustomer,
  redactShop,
} from "~/lib/shopify/compliance";
import { enrichLineItemImages } from "~/lib/shopify/fetch-product-images";
import { ingestEboxOrder } from "~/lib/shopify/ingest-order";
import { mapFulfillmentWebhook } from "~/lib/shopify/map-fulfillment";
import { mapOrderCancellation, mapOrderWebhook } from "~/lib/shopify/map-order";
import {
  isDuplicate,
  recordWebhookEvent,
  verifyHmac,
} from "~/lib/shopify/webhook";
import { notifyOps } from "~/lib/email";

/**
 * Single declarative webhook intake. Verifies HMAC on the raw body, deduplicates
 * by event id, dispatches to the matching deep module, and records the event
 * only on success. A handler failure returns non-2xx so Shopify retries it —
 * transient failures self-heal without a dead-letter table.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();

  const hmac = request.headers.get("X-Shopify-Hmac-Sha256");
  if (!verifyHmac(rawBody, hmac, env.SHOPIFY_API_SECRET)) {
    return new NextResponse("Invalid HMAC", { status: 401 });
  }

  const topic = request.headers.get("X-Shopify-Topic") ?? "";
  const shop = request.headers.get("X-Shopify-Shop-Domain") ?? "";
  const eventId = request.headers.get("X-Shopify-Event-Id") ?? "";

  if (eventId && (await isDuplicate(eventId, { db }))) {
    return NextResponse.json({ deduped: true });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  try {
    await dispatch(topic, shop, payload);
  } catch (error) {
    // Non-2xx → Shopify retries.
    console.error(`Webhook ${topic} failed:`, error);
    return new NextResponse("Handler error", { status: 500 });
  }

  if (eventId) {
    await recordWebhookEvent({ webhookEventId: eventId, topic, shop }, { db });
  }
  return NextResponse.json({ ok: true });
}

async function dispatch(topic: string, shop: string, payload: unknown) {
  switch (topic) {
    case "orders/create": {
      const normalized = mapOrderWebhook(payload, shop);

      // TEMPORARY DIAGNOSTIC (spike #53): checkout-UI metafields written via
      // useApplyMetafieldsChange are not reliably surfacing in the webhook
      // payload, so locker orders get silently skipped. Log exactly what
      // Shopify delivers — the raw `metafields` / `note_attributes` and whether
      // we managed to extract the ebox link — then remove once confirmed.
      const rawOrder = (payload ?? {}) as Record<string, unknown>;
      console.log(
        `orders/create raw for ${shop} order ${normalized.shopifyOrderId}: ` +
          JSON.stringify({
            metafields: rawOrder.metafields ?? null,
            note_attributes: rawOrder.note_attributes ?? null,
            eboxExtracted: normalized.ebox,
          }),
      );

      // Only locker orders are persisted, so only spend an Admin API call
      // backfilling product images for those. Best-effort — never throws.
      if (normalized.ebox) {
        await enrichLineItemImages(normalized, { db });
      }
      const result = await ingestEboxOrder(normalized, { db });

      // Log every outcome. Previously only `rejected` logged, so a `skipped`
      // order (no/malformed ebox link) left no trace at all — which is why a
      // 200 with no created order looked like nothing had happened.
      if (result.result === "rejected") {
        console.warn(
          `orders/create rejected for ${shop} order ${normalized.shopifyOrderId}: ${result.reason}`,
        );
      } else if (result.result === "skipped") {
        console.info(
          `orders/create skipped for ${shop} order ${normalized.shopifyOrderId}: no valid ebox link`,
        );
      } else {
        console.info(
          `orders/create ${result.result} for ${shop} order ${normalized.shopifyOrderId} → ebox order ${result.orderId}`,
        );
      }
      return;
    }
    case "orders/cancelled":
      await cancelEboxOrder(mapOrderCancellation(payload), { db });
      return;
    case "fulfillments/create":
    case "fulfillments/update":
      await applyFulfillment(mapFulfillmentWebhook(payload), { db });
      return;
    case "customers/data_request":
      await recordDataRequest(
        { shop, customerEmail: emailFromPayload(payload), payload },
        { notifyOps },
      );
      return;
    case "customers/redact": {
      const email = emailFromPayload(payload);
      if (email) await redactCustomer({ customerEmail: email }, { db });
      return;
    }
    case "shop/redact":
      await redactShop({ shop }, { db });
      return;
    case "app/uninstalled":
      await deleteShopSession({ shop }, { db });
      return;
    default:
      // Unknown/unsubscribed topic — acknowledge so Shopify stops retrying.
      console.info(`Unhandled webhook topic: ${topic}`);
      return;
  }
}

function emailFromPayload(payload: unknown): string | null {
  if (payload && typeof payload === "object") {
    const customer = (payload as { customer?: { email?: unknown } }).customer;
    if (customer && typeof customer.email === "string") return customer.email;
  }
  return null;
}
