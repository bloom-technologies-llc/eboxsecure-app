import type { PrismaClient } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";

import {
  deleteShopSession,
  recordDataRequest,
  redactCustomer,
  redactShop,
} from "./compliance";

const db = mockDeep<PrismaClient>();
beforeEach(() => mockReset(db));

describe("redactCustomer", () => {
  it("nulls merchant identifiers on only that customer's SHOPIFY orders and retains them", async () => {
    db.customerAccount.findFirst.mockResolvedValue({ id: "cust_1" } as never);
    db.order.updateMany.mockResolvedValue({ count: 2 } as never);

    const res = await redactCustomer({ customerEmail: "a@b.com" }, { db });

    expect(res).toEqual({ ordersScrubbed: 2 });
    expect(db.order.updateMany).toHaveBeenCalledWith({
      where: { customerId: "cust_1", sourceChannel: "SHOPIFY" },
      data: { shopifyShop: null, shopifyOrderId: null },
    });
    // Records are scrubbed, never deleted.
    expect(db.order.deleteMany).not.toHaveBeenCalled();
    expect(db.customerAccount.delete).not.toHaveBeenCalled();
  });

  it("is a no-op when no customer matches the email", async () => {
    db.customerAccount.findFirst.mockResolvedValue(null as never);
    const res = await redactCustomer({ customerEmail: "none@b.com" }, { db });
    expect(res).toEqual({ ordersScrubbed: 0 });
    expect(db.order.updateMany).not.toHaveBeenCalled();
  });
});

describe("redactShop", () => {
  it("deletes session + webhook-event rows and disassociates but retains the shop's orders", async () => {
    db.shopifySession.deleteMany.mockResolvedValue({ count: 1 } as never);
    db.shopifyWebhookEvent.deleteMany.mockResolvedValue({ count: 5 } as never);
    db.order.updateMany.mockResolvedValue({ count: 3 } as never);

    const res = await redactShop({ shop: "s.myshopify.com" }, { db });

    expect(res).toEqual({ ordersScrubbed: 3, sessionsDeleted: 1, eventsDeleted: 5 });
    expect(db.shopifySession.deleteMany).toHaveBeenCalledWith({ where: { shop: "s.myshopify.com" } });
    expect(db.shopifyWebhookEvent.deleteMany).toHaveBeenCalledWith({ where: { shop: "s.myshopify.com" } });
    expect(db.order.updateMany).toHaveBeenCalledWith({
      where: { shopifyShop: "s.myshopify.com" },
      data: { shopifyShop: null, shopifyOrderId: null },
    });
    expect(db.order.deleteMany).not.toHaveBeenCalled();
  });
});

describe("deleteShopSession", () => {
  it("deletes the shop's session(s) on app/uninstalled", async () => {
    db.shopifySession.deleteMany.mockResolvedValue({ count: 1 } as never);
    const res = await deleteShopSession({ shop: "s.myshopify.com" }, { db });
    expect(res).toEqual({ sessionsDeleted: 1 });
  });
});

describe("recordDataRequest", () => {
  it("notifies ops for manual fulfillment with the request details", async () => {
    const notifyOps = vi.fn().mockResolvedValue(undefined);
    await recordDataRequest(
      { shop: "s.myshopify.com", customerEmail: "a@b.com", payload: { foo: 1 } },
      { notifyOps },
    );
    expect(notifyOps).toHaveBeenCalledTimes(1);
    const [subject, body] = notifyOps.mock.calls[0] as [string, string];
    expect(subject).toContain("s.myshopify.com");
    expect(body).toContain("a@b.com");
  });
});
