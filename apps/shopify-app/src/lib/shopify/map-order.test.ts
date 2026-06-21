import { describe, expect, it } from "vitest";

import {
  extractEboxMetafield,
  mapOrderCancellation,
  mapOrderWebhook,
} from "./map-order";

const SHOP = "bloom-dev-store1.myshopify.com";

const orderWith = (extra: Record<string, unknown>) => ({
  id: 5500000000001,
  name: "#1001",
  customer: { email: "Shopper@Example.com" },
  total_price_set: { presentment_money: { amount: "42.50" } },
  ...extra,
});

describe("extractEboxMetafield", () => {
  it("reads the ebox.eboxOrder metafield from the metafields array", () => {
    const ebox = extractEboxMetafield(
      orderWith({
        metafields: [
          { namespace: "other", key: "x", value: "1" },
          {
            namespace: "ebox",
            key: "eboxOrder",
            value: JSON.stringify({ customerId: "cust_123", locationId: 7 }),
          },
        ],
      }),
    );
    expect(ebox).toEqual({ customerId: "cust_123", locationId: 7 });
  });

  it("coerces a string locationId to a number", () => {
    const ebox = extractEboxMetafield(
      orderWith({
        metafields: [
          { namespace: "ebox", key: "eboxOrder", value: '{"customerId":"c1","locationId":"3"}' },
        ],
      }),
    );
    expect(ebox).toEqual({ customerId: "c1", locationId: 3 });
  });

  it("falls back to note_attributes when metafields are absent", () => {
    const ebox = extractEboxMetafield(
      orderWith({
        note_attributes: [
          { name: "eboxOrder", value: '{"customerId":"c9","locationId":2}' },
        ],
      }),
    );
    expect(ebox).toEqual({ customerId: "c9", locationId: 2 });
  });

  it("returns null when the metafield is absent (non-locker order)", () => {
    expect(extractEboxMetafield(orderWith({}))).toBeNull();
  });

  it("returns null on malformed JSON", () => {
    expect(
      extractEboxMetafield(
        orderWith({ metafields: [{ namespace: "ebox", key: "eboxOrder", value: "{not json" }] }),
      ),
    ).toBeNull();
  });

  it("returns null when customerId is missing", () => {
    expect(
      extractEboxMetafield(
        orderWith({ metafields: [{ namespace: "ebox", key: "eboxOrder", value: '{"locationId":1}' }] }),
      ),
    ).toBeNull();
  });

  it("returns null when locationId is not an integer", () => {
    expect(
      extractEboxMetafield(
        orderWith({
          metafields: [{ namespace: "ebox", key: "eboxOrder", value: '{"customerId":"c1","locationId":"abc"}' }],
        }),
      ),
    ).toBeNull();
  });
});

describe("mapOrderWebhook", () => {
  it("normalizes id, name, email, total and the metafield", () => {
    const normalized = mapOrderWebhook(
      orderWith({
        metafields: [
          { namespace: "ebox", key: "eboxOrder", value: '{"customerId":"c1","locationId":4}' },
        ],
      }),
      SHOP,
    );
    expect(normalized).toEqual({
      shopifyOrderId: "5500000000001",
      shopifyShop: SHOP,
      orderName: "#1001",
      email: "Shopper@Example.com",
      total: 42.5,
      ebox: { customerId: "c1", locationId: 4 },
    });
  });

  it("falls back to total_price and order-level email", () => {
    const normalized = mapOrderWebhook(
      { id: 1, total_price: "10.00", email: "fallback@example.com" },
      SHOP,
    );
    expect(normalized.total).toBe(10);
    expect(normalized.email).toBe("fallback@example.com");
    expect(normalized.ebox).toBeNull();
  });

  it("defaults total to 0 when absent", () => {
    expect(mapOrderWebhook({ id: 2 }, SHOP).total).toBe(0);
  });
});

describe("mapOrderCancellation", () => {
  it("extracts the order id and cancel reason", () => {
    expect(mapOrderCancellation({ id: 99, cancel_reason: "customer" })).toEqual({
      shopifyOrderId: "99",
      cancelReason: "customer",
    });
  });

  it("tolerates a missing cancel reason", () => {
    expect(mapOrderCancellation({ id: 99 }).cancelReason).toBeNull();
  });
});
