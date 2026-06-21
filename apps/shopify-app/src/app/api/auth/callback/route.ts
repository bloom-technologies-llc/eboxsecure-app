import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

import { db } from "@ebox/db";

import { env } from "~/env";
import {
  exchangeCodeForToken,
  isValidShopDomain,
  verifyOAuthCallbackHmac,
} from "~/lib/shopify/oauth";
import { storeSession } from "~/lib/shopify/session";

export const runtime = "nodejs";

const STATE_COOKIE = "shopify_oauth_state";

/**
 * OAuth callback: complete the authorization code grant and persist the offline
 * session.
 *
 * Defense in depth: validate the `shop` host, the request `hmac` (proves the
 * params came from Shopify, untampered), and the `state` nonce from our signed
 * cookie (CSRF). Only then exchange the code for a token, store the session, and
 * bounce the merchant into the embedded app.
 */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const params = url.searchParams;

  const shop = params.get("shop");
  const code = params.get("code");
  const state = params.get("state");

  if (!isValidShopDomain(shop) || !code || !state) {
    return new NextResponse("Invalid OAuth callback", { status: 400 });
  }

  if (!verifyOAuthCallbackHmac(params, env.SHOPIFY_API_SECRET)) {
    return new NextResponse("HMAC validation failed", { status: 401 });
  }

  // Verify the signed state cookie: it must decode with our secret, be unexpired,
  // and match both the returned `state` and the `shop` it was minted for.
  const cookieValue = cookies().get(STATE_COOKIE)?.value;
  if (!cookieValue) {
    return new NextResponse("Missing OAuth state", { status: 401 });
  }
  try {
    const secret = new TextEncoder().encode(env.SHOPIFY_API_SECRET);
    const { payload } = await jwtVerify(cookieValue, secret);
    if (payload.state !== state || payload.shop !== shop) {
      return new NextResponse("OAuth state mismatch", { status: 401 });
    }
  } catch {
    return new NextResponse("Invalid or expired OAuth state", { status: 401 });
  }

  let token: { accessToken: string; scope: string };
  try {
    token = await exchangeCodeForToken({
      shop,
      apiKey: env.SHOPIFY_API_KEY,
      apiSecret: env.SHOPIFY_API_SECRET,
      code,
    });
  } catch (error) {
    console.error(`OAuth token exchange failed for ${shop}:`, error);
    return new NextResponse("Token exchange failed", { status: 502 });
  }

  await storeSession(
    { shop, state, scope: token.scope, accessToken: token.accessToken },
    { db },
  );

  // One-time nonce — clear it so it can't be replayed.
  cookies().delete(STATE_COOKIE);

  // Land the merchant on the embedded status page. `host` is Shopify's
  // base64 embed param, passed through so App Bridge can initialize.
  const dest = new URL("/", url);
  dest.searchParams.set("shop", shop);
  const host = params.get("host");
  if (host) dest.searchParams.set("host", host);

  return NextResponse.redirect(dest);
}
