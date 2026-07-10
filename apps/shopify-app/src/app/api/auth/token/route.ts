import { NextResponse } from "next/server";

import { db } from "@ebox/db";

import { env } from "~/env";
import {
  exchangeSessionTokenForToken,
  verifySessionToken,
} from "~/lib/shopify/oauth";
import { storeSession } from "~/lib/shopify/session";

export const runtime = "nodejs";

/**
 * Managed-installation token bootstrap.
 *
 * The embedded client (see `InstallBootstrap`) posts its App Bridge session
 * token in the `Authorization: Bearer` header. We verify it (proving the caller
 * is a real merchant session for *this* app), exchange it for an offline access
 * token, and persist the session — after which webhook/background work can call
 * the Admin API. No OAuth redirect/callback is involved.
 */
export async function POST(request: Request): Promise<Response> {
  const authHeader = request.headers.get("authorization") ?? "";
  const sessionToken = /^bearer\s+/i.test(authHeader)
    ? authHeader.replace(/^bearer\s+/i, "").trim()
    : "";

  if (!sessionToken) {
    return NextResponse.json(
      { error: "Missing session token" },
      { status: 401 },
    );
  }

  let shop: string;
  try {
    ({ shop } = await verifySessionToken(sessionToken, {
      apiKey: env.SHOPIFY_API_KEY,
      apiSecret: env.SHOPIFY_API_SECRET,
    }));
  } catch (error) {
    console.error("Session token verification failed:", error);
    return NextResponse.json(
      { error: "Invalid session token" },
      { status: 401 },
    );
  }

  let token: { accessToken: string; scope: string };
  try {
    token = await exchangeSessionTokenForToken({
      shop,
      apiKey: env.SHOPIFY_API_KEY,
      apiSecret: env.SHOPIFY_API_SECRET,
      sessionToken,
    });
  } catch (error) {
    console.error(`Token exchange failed for ${shop}:`, error);
    return NextResponse.json({ error: "Token exchange failed" }, { status: 502 });
  }

  await storeSession(
    { shop, scope: token.scope, accessToken: token.accessToken },
    { db },
  );

  return NextResponse.json({ connected: true, shop });
}
