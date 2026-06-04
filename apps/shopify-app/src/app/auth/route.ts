import { randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { SignJWT } from "jose";

import { env } from "~/env";
import { buildAuthorizeUrl, isValidShopDomain } from "~/lib/shopify/oauth";

export const runtime = "nodejs";

/** OAuth scopes requested at install — must match `shopify.app.toml`. */
const SCOPES = "read_orders,read_customers,read_fulfillments";

/** Cookie carrying the signed OAuth `state` (CSRF nonce) until the callback. */
const STATE_COOKIE = "shopify_oauth_state";
const STATE_TTL_SECONDS = 600; // 10 minutes — long enough for the merchant to approve.

/**
 * Begin merchant OAuth (authorization code grant, offline token).
 *
 * Reads `?shop=`, validates it's a real `*.myshopify.com` host, mints a random
 * `state` nonce, stashes it in a short-lived signed (HttpOnly) cookie, and
 * redirects to Shopify's authorize URL. The callback (`/api/auth/callback`)
 * verifies that same `state` to defeat CSRF. State is signed with the app
 * secret (via `jose`) rather than stored in Redis to keep install stateless.
 */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!isValidShopDomain(shop)) {
    return new NextResponse("Missing or invalid 'shop' parameter", {
      status: 400,
    });
  }

  const state = randomBytes(16).toString("hex");
  const redirectUri = `${resolveAppOrigin(request)}/api/auth/callback`;

  const authorizeUrl = buildAuthorizeUrl({
    shop,
    apiKey: env.SHOPIFY_API_KEY,
    scopes: SCOPES,
    redirectUri,
    state,
  });

  // Bind the nonce to this shop and sign it so the callback can trust it without
  // server-side storage. Short TTL limits the replay window.
  const secret = new TextEncoder().encode(env.SHOPIFY_API_SECRET);
  const signedState = await new SignJWT({ shop, state })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${STATE_TTL_SECONDS}s`)
    .sign(secret);

  cookies().set(STATE_COOKIE, signedState, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: STATE_TTL_SECONDS,
  });

  return NextResponse.redirect(authorizeUrl);
}

/**
 * Absolute origin to build the OAuth redirect_uri. Prefers `SHOPIFY_APP_URL`
 * (the registered, stable URL) and falls back to forwarded request headers so
 * the flow works behind the tunnel/proxy in dev without extra config.
 */
function resolveAppOrigin(request: Request): string {
  if (env.SHOPIFY_APP_URL) return env.SHOPIFY_APP_URL.replace(/\/$/, "");

  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host =
    h.get("x-forwarded-host") ?? h.get("host") ?? new URL(request.url).host;
  return `${proto}://${host}`;
}
