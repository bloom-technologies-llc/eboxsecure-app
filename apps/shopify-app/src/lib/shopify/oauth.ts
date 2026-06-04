import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Merchant-side OAuth (authorization code grant for an *offline* access token).
 * Pure, network-free helpers — the only side-effecting one
 * (`exchangeCodeForToken`) takes an injected `fetchImpl` so it's unit-testable.
 *
 * This is the "main net-new work" flagged in ADR 0002: token-exchange OAuth is
 * hand-rolled rather than pulling in `@shopify/shopify-api`. The HMAC style
 * mirrors `webhook.ts` (constant-time compare, fail-closed on bad input).
 */

/** A Shopify shop domain: `^[a-z0-9][a-z0-9-]*\.myshopify\.com$` (lowercased). */
const SHOP_DOMAIN_RE = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;

/**
 * Is `shop` a well-formed `*.myshopify.com` host? The `shop` param is
 * attacker-controlled on the install entry point, so every flow validates it
 * before it's interpolated into an outbound URL or persisted.
 */
export function isValidShopDomain(
  shop: string | null | undefined,
): shop is string {
  if (!shop) return false;
  return SHOP_DOMAIN_RE.test(shop);
}

export interface BuildAuthorizeUrlInput {
  shop: string;
  apiKey: string;
  scopes: string;
  redirectUri: string;
  state: string;
}

/**
 * Build the `https://{shop}/admin/oauth/authorize?...` URL that begins the
 * authorization code grant. No `grant_options[]` ⇒ Shopify issues an *offline*
 * (long-lived) token, which is what the webhook/session storage needs.
 */
export function buildAuthorizeUrl(input: BuildAuthorizeUrlInput): string {
  const params = new URLSearchParams({
    client_id: input.apiKey,
    scope: input.scopes,
    redirect_uri: input.redirectUri,
    state: input.state,
  });
  return `https://${input.shop}/admin/oauth/authorize?${params.toString()}`;
}

/**
 * Verify Shopify's `hmac` query param on the OAuth callback.
 *
 * Per Shopify's spec: drop `hmac`/`signature`, sort the remaining params by key,
 * re-encode them as `key=value&...`, HMAC-SHA256 with the app secret, and
 * compare (constant-time) against the provided hex digest. Returns false on any
 * missing/malformed input rather than throwing — same fail-closed contract as
 * `verifyHmac` in `webhook.ts`.
 */
export function verifyOAuthCallbackHmac(
  queryParams: URLSearchParams | Record<string, string>,
  apiSecret: string,
): boolean {
  if (!apiSecret) return false;

  const entries =
    queryParams instanceof URLSearchParams
      ? [...queryParams.entries()]
      : Object.entries(queryParams);

  let provided: string | undefined;
  const rest: [string, string][] = [];
  for (const [key, value] of entries) {
    if (key === "hmac" || key === "signature") {
      if (key === "hmac") provided = value;
      continue;
    }
    rest.push([key, value]);
  }
  if (!provided) return false;

  rest.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  const message = rest.map(([k, v]) => `${k}=${v}`).join("&");

  const digest = createHmac("sha256", apiSecret)
    .update(message, "utf8")
    .digest();

  let providedBuf: Buffer;
  try {
    providedBuf = Buffer.from(provided, "hex");
  } catch {
    return false;
  }
  // timingSafeEqual throws on differing lengths, so guard first.
  if (providedBuf.length !== digest.length) return false;
  return timingSafeEqual(providedBuf, digest);
}

export interface ExchangeCodeInput {
  shop: string;
  apiKey: string;
  apiSecret: string;
  code: string;
}

export interface ExchangeCodeDeps {
  /** Injected for testability; defaults to the platform `fetch`. */
  fetchImpl?: typeof globalThis.fetch;
}

export interface AccessTokenResult {
  accessToken: string;
  scope: string;
}

/**
 * Exchange the one-time authorization `code` for an offline access token by
 * POSTing to `https://{shop}/admin/oauth/access_token`. Throws on a non-2xx
 * response or a malformed body so the callback route can fail the install
 * loudly instead of persisting a junk session.
 */
export async function exchangeCodeForToken(
  input: ExchangeCodeInput,
  deps: ExchangeCodeDeps = {},
): Promise<AccessTokenResult> {
  const fetchImpl = deps.fetchImpl ?? globalThis.fetch;

  const response = await fetchImpl(
    `https://${input.shop}/admin/oauth/access_token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: input.apiKey,
        client_secret: input.apiSecret,
        code: input.code,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Shopify token exchange failed for ${input.shop}: ${response.status}`,
    );
  }

  const body = (await response.json()) as {
    access_token?: unknown;
    scope?: unknown;
  };
  if (typeof body.access_token !== "string" || typeof body.scope !== "string") {
    throw new Error(
      `Shopify token exchange returned a malformed body for ${input.shop}`,
    );
  }

  return { accessToken: body.access_token, scope: body.scope };
}
