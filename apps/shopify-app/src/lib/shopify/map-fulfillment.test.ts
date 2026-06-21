import { describe, expect, it } from "vitest";

import { mapFulfillmentWebhook } from "./map-fulfillment";

describe("mapFulfillmentWebhook", () => {
  it("reads a single tracking_number", () => {
    expect(
      mapFulfillmentWebhook({
        order_id: 5500000000001,
        tracking_number: "1Z999",
        tracking_company: "UPS",
      }),
    ).toEqual({
      shopifyOrderId: "5500000000001",
      trackingNumber: "1Z999",
      trackingCompany: "UPS",
    });
  });

  it("falls back to the first of tracking_numbers", () => {
    expect(
      mapFulfillmentWebhook({
        order_id: 1,
        tracking_numbers: ["TRK-A", "TRK-B"],
        tracking_company: "FedEx",
      }).trackingNumber,
    ).toBe("TRK-A");
  });

  it("tolerates missing tracking", () => {
    expect(mapFulfillmentWebhook({ order_id: 1 })).toEqual({
      shopifyOrderId: "1",
      trackingNumber: null,
      trackingCompany: null,
    });
  });
});
