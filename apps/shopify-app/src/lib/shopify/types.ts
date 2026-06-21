import type { PrismaClient } from "@prisma/client";

/**
 * The deterministic-linking payload the checkout extension writes into the
 * `ebox.eboxOrder` order metafield: the authenticated EboxSecure customer and
 * the chosen Location. Validated for existence at ingestion (trust-but-validate)
 * — never trusted blindly because it is written client-side.
 */
export interface EboxMetafield {
  customerId: string;
  locationId: number;
}

/**
 * Normalized shape of an `orders/create` webhook, decoupled from Shopify's raw
 * payload. `ebox` is null when the order is not a locker order (metafield absent
 * or malformed), which the ingestion gate uses to skip non-Ebox orders.
 */
export interface NormalizedOrder {
  shopifyOrderId: string;
  shopifyShop: string;
  orderName: string | null;
  email: string | null;
  total: number;
  ebox: EboxMetafield | null;
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
