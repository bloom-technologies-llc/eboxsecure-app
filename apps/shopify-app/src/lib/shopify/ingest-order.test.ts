import type { PrismaClient } from "@prisma/client";
import { beforeEach, describe, expect, it } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";

import { ingestEboxOrder } from "./ingest-order";
import type { NormalizedOrder } from "./types";

const db = mockDeep<PrismaClient>();
beforeEach(() => mockReset(db));

const lockerOrder = (overrides: Partial<NormalizedOrder> = {}): NormalizedOrder => ({
  shopifyOrderId: "5500000000001",
  shopifyShop: "bloom-dev-store1.myshopify.com",
  orderName: "#1001",
  email: "shopper@example.com",
  total: 42.5,
  ebox: { customerId: "cust_123", locationId: 7 },
  ...overrides,
});

describe("ingestEboxOrder", () => {
  it("skips an order with no ebox metafield (non-locker order)", async () => {
    const res = await ingestEboxOrder(lockerOrder({ ebox: null }), { db });
    expect(res).toEqual({ result: "skipped" });
    expect(db.order.create).not.toHaveBeenCalled();
  });

  it("rejects when the metafield customerId does not exist", async () => {
    db.customerAccount.findUnique.mockResolvedValue(null as never);
    const res = await ingestEboxOrder(lockerOrder(), { db });
    expect(res).toEqual({ result: "rejected", reason: "unknown-customer" });
    expect(db.order.create).not.toHaveBeenCalled();
  });

  it("rejects when the metafield locationId does not exist", async () => {
    db.customerAccount.findUnique.mockResolvedValue({ id: "cust_123" } as never);
    db.location.findUnique.mockResolvedValue(null as never);
    const res = await ingestEboxOrder(lockerOrder(), { db });
    expect(res).toEqual({ result: "rejected", reason: "unknown-location" });
    expect(db.order.create).not.toHaveBeenCalled();
  });

  it("creates a SHOPIFY Order with the metafield's location and customer", async () => {
    db.customerAccount.findUnique.mockResolvedValue({ id: "cust_123" } as never);
    db.location.findUnique.mockResolvedValue({ id: 7 } as never);
    db.order.findUnique.mockResolvedValue(null as never);
    db.order.create.mockResolvedValue({ id: 1001 } as never);

    const res = await ingestEboxOrder(lockerOrder(), { db });

    expect(res).toEqual({ result: "created", orderId: 1001 });
    expect(db.order.create).toHaveBeenCalledTimes(1);
    expect(db.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          customerId: "cust_123",
          shippedLocationId: 7,
          shopifyOrderId: "5500000000001",
          sourceChannel: "SHOPIFY",
          total: 42.5,
          processedAt: null,
        }),
      }),
    );
  });

  it("updates idempotently when the Order already exists (same shopifyOrderId)", async () => {
    db.customerAccount.findUnique.mockResolvedValue({ id: "cust_123" } as never);
    db.location.findUnique.mockResolvedValue({ id: 7 } as never);
    db.order.findUnique.mockResolvedValue({ id: 1001 } as never);
    db.order.update.mockResolvedValue({ id: 1001 } as never);

    const res = await ingestEboxOrder(lockerOrder({ total: 50 }), { db });

    expect(res).toEqual({ result: "updated", orderId: 1001 });
    expect(db.order.create).not.toHaveBeenCalled();
    expect(db.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1001 },
        data: expect.objectContaining({ total: 50, shippedLocationId: 7 }),
      }),
    );
  });
});
