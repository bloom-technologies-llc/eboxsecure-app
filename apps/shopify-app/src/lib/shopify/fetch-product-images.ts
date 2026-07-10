import { loadSessionByShop } from "./session";
import type { Db, NormalizedOrder } from "./types";

/**
 * Admin REST API version used for product lookups. Pinned deliberately so a
 * Shopify version bump is an explicit code change rather than a silent shift.
 */
const ADMIN_API_VERSION = "2025-01";

interface EnrichDeps {
  db: Db;
  /** Injected for testability; defaults to the platform `fetch`. */
  fetchImpl?: typeof globalThis.fetch;
}

/**
 * Best-effort: backfill each line item's `imageUrl` from the shop's product
 * images via the Admin REST API. The `orders/create` webhook payload carries no
 * product images, so this is the only way to show a real thumbnail.
 *
 * Deliberately never throws — a missing/failed image is cosmetic and must not
 * fail order ingestion (which would make Shopify retry the whole webhook). Any
 * problem (no session, revoked token, API error, rate limit) simply leaves the
 * affected `imageUrl` null and the card falls back to a neutral placeholder.
 * Mutates `order.lineItems` in place.
 */
export async function enrichLineItemImages(
  order: NormalizedOrder,
  deps: EnrichDeps,
): Promise<void> {
  const fetchImpl = deps.fetchImpl ?? globalThis.fetch;

  const productIds = [
    ...new Set(
      order.lineItems
        .map((li) => li.shopifyProductId)
        .filter((id): id is string => !!id),
    ),
  ];
  if (productIds.length === 0) return;

  let accessToken: string;
  try {
    const session = await loadSessionByShop(order.shopifyShop, { db: deps.db });
    if (!session) return;
    accessToken = session.accessToken;
  } catch (error) {
    console.warn(`Could not load Shopify session for ${order.shopifyShop}:`, error);
    return;
  }

  let imagesByProduct: Map<string, string>;
  try {
    imagesByProduct = await fetchProductImages(order.shopifyShop, productIds, {
      accessToken,
      fetchImpl,
    });
  } catch (error) {
    console.warn(`Could not fetch product images for ${order.shopifyShop}:`, error);
    return;
  }

  for (const li of order.lineItems) {
    if (!li.shopifyProductId) continue;
    const url = imagesByProduct.get(li.shopifyProductId);
    if (url) li.imageUrl = url;
  }
}

/**
 * Fetch featured product images for the given product ids in a single Admin
 * REST call, returning a productId → image src map. Products without an image
 * are simply absent from the map. Throws on a non-2xx response so the caller
 * can swallow it (see `enrichLineItemImages`).
 */
async function fetchProductImages(
  shop: string,
  productIds: string[],
  deps: { accessToken: string; fetchImpl: typeof globalThis.fetch },
): Promise<Map<string, string>> {
  const url =
    `https://${shop}/admin/api/${ADMIN_API_VERSION}/products.json` +
    `?ids=${productIds.join(",")}&fields=id,image`;

  const response = await deps.fetchImpl(url, {
    headers: {
      "X-Shopify-Access-Token": deps.accessToken,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Shopify products fetch failed for ${shop}: ${response.status}`);
  }

  const body = (await response.json()) as {
    products?: { id?: unknown; image?: { src?: unknown } | null }[];
  };

  const map = new Map<string, string>();
  for (const product of body.products ?? []) {
    const id = product.id;
    const src = product.image?.src;
    if (
      (typeof id === "number" || typeof id === "string") &&
      typeof src === "string" &&
      src.length > 0
    ) {
      map.set(String(id), src);
    }
  }
  return map;
}
