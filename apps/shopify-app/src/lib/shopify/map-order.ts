import type {
  EboxMetafield,
  NormalizedCancellation,
  NormalizedOrder,
} from "./types";

const EBOX_NAMESPACE = "ebox";
const EBOX_KEY = "eboxOrder";

interface RawMetafield {
  namespace?: unknown;
  key?: unknown;
  value?: unknown;
}

interface RawNoteAttribute {
  name?: unknown;
  value?: unknown;
}

/**
 * Pull the `ebox.eboxOrder` payload out of a raw `orders/create` webhook.
 *
 * Looks in the order `metafields` array first (registered under the `ebox`
 * namespace), then falls back to `note_attributes` keyed `eboxOrder` — the
 * fallback path the metafield-propagation spike (#53) selects if metafields
 * don't reach the webhook. Returns null when absent or malformed, so a
 * non-locker order maps to `ebox: null` and is later skipped.
 */
export function extractEboxMetafield(raw: unknown): EboxMetafield | null {
  if (raw === null || typeof raw !== "object") return null;
  const order = raw as Record<string, unknown>;

  let rawValue: unknown;

  const metafields = order.metafields;
  if (Array.isArray(metafields)) {
    const match = (metafields as RawMetafield[]).find(
      (m) => m?.namespace === EBOX_NAMESPACE && m?.key === EBOX_KEY,
    );
    if (match) rawValue = match.value;
  }

  if (rawValue === undefined) {
    const noteAttributes = order.note_attributes;
    if (Array.isArray(noteAttributes)) {
      const match = (noteAttributes as RawNoteAttribute[]).find(
        (n) => n?.name === EBOX_KEY,
      );
      if (match) rawValue = match.value;
    }
  }

  if (rawValue === undefined || rawValue === null) return null;

  return parseEboxMetafield(rawValue);
}

/** Parse a metafield value (JSON string or object) into a validated `EboxMetafield`. */
function parseEboxMetafield(value: unknown): EboxMetafield | null {
  let parsed: unknown = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      return null;
    }
  }

  if (parsed === null || typeof parsed !== "object") return null;
  const obj = parsed as Record<string, unknown>;

  const customerId =
    typeof obj.customerId === "string" ? obj.customerId.trim() : "";

  const locationId =
    typeof obj.locationId === "number"
      ? obj.locationId
      : typeof obj.locationId === "string"
        ? Number(obj.locationId)
        : NaN;

  if (!customerId) return null;
  if (!Number.isInteger(locationId)) return null;

  return { customerId, locationId };
}

function asString(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "bigint") {
    return value.toString();
  }
  return null;
}

/** Extract the order total, preferring presentment money, falling back to `total_price`. */
function extractTotal(order: Record<string, unknown>): number {
  const set = order.total_price_set as
    | { presentment_money?: { amount?: unknown }; shop_money?: { amount?: unknown } }
    | undefined;
  const presentment = set?.presentment_money?.amount ?? set?.shop_money?.amount;
  const candidate = presentment ?? order.total_price;
  const n =
    typeof candidate === "number" ? candidate : parseFloat(String(candidate));
  return Number.isFinite(n) ? n : 0;
}

/**
 * Map a raw `orders/create` webhook body to a `NormalizedOrder`. `shop` comes
 * from the `X-Shopify-Shop-Domain` header (not reliably in the body).
 */
export function mapOrderWebhook(raw: unknown, shop: string): NormalizedOrder {
  const order = (raw ?? {}) as Record<string, unknown>;
  const customer = order.customer as { email?: unknown } | undefined;

  const email =
    asString(customer?.email) ??
    asString(order.email) ??
    asString(order.contact_email);

  return {
    shopifyOrderId: asString(order.id) ?? "",
    shopifyShop: shop,
    orderName: asString(order.name),
    email,
    total: extractTotal(order),
    ebox: extractEboxMetafield(order),
  };
}

/** Map a raw `orders/cancelled` webhook body to a `NormalizedCancellation`. */
export function mapOrderCancellation(raw: unknown): NormalizedCancellation {
  const order = (raw ?? {}) as Record<string, unknown>;
  return {
    shopifyOrderId: asString(order.id) ?? "",
    cancelReason: asString(order.cancel_reason),
  };
}
