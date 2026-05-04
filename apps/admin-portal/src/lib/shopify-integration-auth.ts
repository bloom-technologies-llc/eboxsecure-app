import { NextResponse } from "next/server";

/**
 * Validates the X-Shopify-Integration-Key header against the shared secret.
 * Returns null if valid, or a NextResponse error if invalid.
 */
export function validateShopifyIntegrationKey(
  request: Request,
): NextResponse | null {
  const apiKey = request.headers.get("X-Shopify-Integration-Key");
  const expectedKey = process.env.SHOPIFY_INTEGRATION_API_KEY;

  if (!expectedKey) {
    console.error("SHOPIFY_INTEGRATION_API_KEY is not configured");
    return NextResponse.json(
      { error: "Integration not configured" },
      { status: 500 },
    );
  }

  if (!apiKey || apiKey !== expectedKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
