import { jwtVerify } from "jose";
import type { JWTPayload } from "jose";

/**
 * Merchant-side auth for a *managed-installation* app. Shopify grants the app's
 * scopes at install time (no OAuth redirect dance); the app then obtains an
 * *offline* access token by exchanging the App Bridge session token — Shopify's
 * "token exchange" grant. These helpers are pure except
 * `exchangeSessionTokenForToken`, which takes an injected `fetchImpl` so it's
 * unit-testable.
 *
 * Hand-rolled rather than pulling in `@shopify/shopify-api` (ADR 0002). The
 * fail-closed style (throw on anything unexpected) mirrors `webhook.ts`.
 */

/** A Shopify shop domain: `^[a-z0-9][a-z0-9-]*\.myshopify\.com$` (lowercased). */
const SHOP_DOMAIN_RE = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;

/**
 * Is `shop` a well-formed `*.myshopify.com` host? The shop is attacker-derivable
 * from token claims, so every flow validates it before it's interpolated into an
 * outbound URL or persisted.
 */
export function isValidShopDomain(
  shop: string | null | undefined,
): shop is string {
  if (!shop) return false;
  return SHOP_DOMAIN_RE.test(shop);
}

export interface AccessTokenResult {
  accessToken: string;
  scope: string;
}

export interface VerifySessionTokenInput {
  /** The app's client_id — must equal the session token's `aud` claim. */
  apiKey: string;
  /** The app's client secret — the HS256 signing key for session tokens. */
  apiSecret: string;
}

/**
 * Verify an App Bridge **session token** (an `id_token` JWT, HS256-signed with
 * the app secret) and return the shop it was minted for.
 *
 * `jose` enforces the signature and `exp`/`nbf`; we additionally enforce that
 * `aud` is *our* app (defeats tokens minted for another app) and that `dest` is
 * a real `*.myshopify.com` host (before we ever POST to it). Throws on any
 * failure rather than returning a bad shop.
 */
export async function verifySessionToken(
  token: string,
  input: VerifySessionTokenInput,
): Promise<{ shop: string; payload: JWTPayload }> {
  const secret = new TextEncoder().encode(input.apiSecret);
  const { payload } = await jwtVerify(token, secret, {
    algorithms: ["HS256"],
    audience: input.apiKey,
  });

  // `dest` is the shop's storefront origin, e.g. `https://acme.myshopify.com`.
  const dest = typeof payload.dest === "string" ? payload.dest : "";
  let shop: string | null = null;
  try {
    shop = new URL(dest).host;
  } catch {
    shop = null;
  }
  if (!isValidShopDomain(shop)) {
    throw new Error("Session token 'dest' is not a valid shop domain");
  }

  return { shop, payload };
}

export interface ExchangeSessionTokenInput {
  shop: string;
  apiKey: string;
  apiSecret: string;
  /** The verified App Bridge session token to exchange. */
  sessionToken: string;
}

export interface ExchangeDeps {
  /** Injected for testability; defaults to the platform `fetch`. */
  fetchImpl?: typeof globalThis.fetch;
}

/**
 * Exchange an App Bridge session token for an **offline** access token via
 * Shopify's token-exchange grant (POST `https://{shop}/admin/oauth/access_token`).
 * Offline (long-lived, no user attached) so the same token keeps working for
 * webhook/background work. Throws on a non-2xx response or a malformed body so
 * the caller fails loudly instead of persisting a junk session.
 */
export async function exchangeSessionTokenForToken(
  input: ExchangeSessionTokenInput,
  deps: ExchangeDeps = {},
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
        grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
        subject_token: input.sessionToken,
        subject_token_type: "urn:ietf:params:oauth:token-type:id_token",
        requested_token_type:
          "urn:shopify:params:oauth:token-type:offline-access-token",
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
