import type { PrismaClient } from "@prisma/client";

/**
 * The deterministic-linking payload the checkout extension writes into the
 * `eboxOrder` cart attribute (delivered as a `note_attributes` entry on the
 * `orders/create` webhook): the authenticated EboxSecure customer and the chosen
 * Location. Validated for existence at ingestion (trust-but-validate) — never
 * trusted blindly because it is written client-side.
 */
export interface EboxMetafield {
  customerId: string;
  locationId: number;
}

/**
 * A single product line on an `orders/create` webhook. `title`/`quantity` and
 * the Shopify ids come straight from the payload; `imageUrl` is null until the
 * best-effort Admin API backfill fills it in (see `enrichLineItemImages`), since
 * the webhook payload does not carry product images.
 */
export interface NormalizedLineItem {
  title: string;
  quantity: number;
  /** Per-unit price in the shop currency, or null if the payload omits it. */
  price: number | null;
  shopifyProductId: string | null;
  shopifyVariantId: string | null;
  imageUrl: string | null;
}

/**
 * Normalized shape of an `orders/create` webhook, decoupled from Shopify's raw
 * payload. `ebox` is null when the order is not a locker order (link absent
 * or malformed), which the ingestion gate uses to skip non-Ebox orders.
 */
export interface NormalizedOrder {
  shopifyOrderId: string;
  shopifyShop: string;
  orderName: string | null;
  email: string | null;
  total: number;
  ebox: EboxMetafield | null;
  lineItems: NormalizedLineItem[];
}

/** Normalized shape of a `fulfillments/create|update` webhook. */
export interface NormalizedFulfillment {
  shopifyOrderId: string;
  trackingNumber: string | null;
  trackingCompany: string | null;
}

/** Normalized shape of an `orders/cancelled` webhook. */
export interface NormalizedCancellation {
  shopifyOrderId: string;
  cancelReason: string | null;
}

/** Minimal Redis surface the OTP service needs (satisfied by `@ebox/redis-client`'s `kv`). */
export interface RedisLike {
  set(key: string, value: string, opts: { ex: number }): Promise<unknown>;
  get<T = string>(key: string): Promise<T | null>;
  del(key: string): Promise<unknown>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<unknown>;
}

/** Database dependency injected into the deep modules (a real or mocked Prisma client). */
export type Db = PrismaClient;
