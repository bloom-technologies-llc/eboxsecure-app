import type { NormalizedFulfillment } from "./types";

function asString(value: unknown): string | null {
  if (typeof value === "string") return value.length > 0 ? value : null;
  if (typeof value === "number" || typeof value === "bigint") {
    return value.toString();
  }
  return null;
}

/**
 * Map a raw `fulfillments/create|update` webhook body to a
 * `NormalizedFulfillment`. Shopify sends tracking either as a single
 * `tracking_number` or as a `tracking_numbers` array; we take the first.
 */
export function mapFulfillmentWebhook(raw: unknown): NormalizedFulfillment {
  const f = (raw ?? {}) as Record<string, unknown>;

  const numbers = f.tracking_numbers;
  const trackingNumber =
    asString(f.tracking_number) ??
    (Array.isArray(numbers) ? asString(numbers[0]) : null);

  return {
    shopifyOrderId: asString(f.order_id) ?? "",
    trackingNumber,
    trackingCompany: asString(f.tracking_company),
  };
}
