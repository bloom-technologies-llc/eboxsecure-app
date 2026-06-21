import { NextResponse } from "next/server";

import { db } from "@ebox/db";

import { env } from "~/env";
import { listLocations } from "~/lib/shopify/locations";
import { verifyShopperToken } from "~/lib/shopify/otp";

export const runtime = "nodejs";

/**
 * Pickup locations for the checkout extension's picker. Gated by the shopper
 * JWT issued by verify-otp (Bearer token), so only signed-in shoppers can
 * enumerate locations.
 */
export async function GET(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await verifyShopperToken(token, env.SHOPIFY_INTEGRATION_JWT_SECRET);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await listLocations({ db });
  return NextResponse.json({ data });
}
