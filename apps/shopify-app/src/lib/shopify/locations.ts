import type { Db } from "./types";

export interface EboxLocationDto {
  id: number;
  name: string;
  label: string;
  value: {
    address1: string | undefined;
    address2: string | undefined;
    city: string | undefined;
    zip: string | undefined;
    provinceCode: string | undefined;
    countryCode: string;
  };
}

/**
 * List pickup locations shaped for the checkout extension's location picker.
 * `value` matches Shopify's `ShippingAddress` so the extension can apply it
 * directly, and `id` is the EboxSecure `Location.id` the extension writes into
 * the order metafield as `locationId` (ADR 0001). `label` is a stable slug used
 * as the `<Select>` option value.
 */
export async function listLocations(deps: {
  db: Db;
}): Promise<EboxLocationDto[]> {
  const locations = await deps.db.location.findMany({
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

  return locations.map((loc) => ({
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
}
