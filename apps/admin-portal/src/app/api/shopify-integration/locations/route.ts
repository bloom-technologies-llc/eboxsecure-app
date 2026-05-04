import { NextResponse } from "next/server";

import { db } from "@ebox/db";

import { validateShopifyIntegrationKey } from "~/lib/shopify-integration-auth";

export async function GET(request: Request) {
  const authError = validateShopifyIntegrationKey(request);
  if (authError) return authError;

  const locations = await db.location.findMany({
    select: {
      id: true,
      name: true,
      address: true,
      address1: true,
      address2: true,
      city: true,
      state: true,
      zip: true,
      countryCode: true,
    },
  });

  // Format for Shopify's ShippingAddress type
  const formatted = locations.map((loc) => ({
    id: loc.id,
    name: loc.name,
    label: loc.name.toLowerCase().replace(/\s+/g, "-"),
    value: {
      address1: loc.address1 ?? loc.address,
      address2: loc.address2 ?? undefined,
      city: loc.city ?? undefined,
      zip: loc.zip ?? undefined,
      provinceCode: loc.state ?? undefined,
      countryCode: loc.countryCode ?? "US",
    },
  }));

  return NextResponse.json({ data: formatted });
}
