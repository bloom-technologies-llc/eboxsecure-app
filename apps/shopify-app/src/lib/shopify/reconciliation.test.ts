import type { PrismaClient } from "@prisma/client";
import { beforeEach, describe, expect, it } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";

import {
  DEFAULT_STALE_AFTER_HOURS,
  findUnmatchedShopifyOrders,
} from "./reconciliation";

const db = mockDeep<PrismaClient>();
beforeEach(() => mockReset(db));

describe("findUnmatchedShopifyOrders", () => {
  it("queries active SHOPIFY orders that are untracked or stale-unprocessed", async () => {
    db.order.findMany.mockResolvedValue([] as never);
    const now = new Date("2026-06-04T00:00:00.000Z");

    await findUnmatchedShopifyOrders({ db }, { now, staleAfterHours: 24 });

    const arg = db.order.findMany.mock.calls[0]?.[0] as {
      where: Record<string, unknown> & { OR: unknown[] };
    };
    expect(arg.where).toMatchObject({
      sourceChannel: "SHOPIFY",
      cancelledAt: null,
      pickedUpAt: null,
    });
    // Either no tracking, or unprocessed and older than the stale cutoff.
    const staleBefore = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    expect(arg.where.OR).toEqual([
      { trackingNumber: null },
      { AND: [{ processedAt: null }, { createdAt: { lt: staleBefore } }] },
    ]);
  });

  it("returns the rows surfaced for ops", async () => {
    const rows = [
      {
        id: 1,
        shopifyOrderId: "55001",
        shopifyShop: "s.myshopify.com",
        trackingNumber: null,
        createdAt: new Date(),
        processedAt: null,
      },
    ];
    db.order.findMany.mockResolvedValue(rows as never);
    const res = await findUnmatchedShopifyOrders({ db });
    expect(res).toEqual(rows);
  });

  it("defaults the stale window to 48h", () => {
    expect(DEFAULT_STALE_AFTER_HOURS).toBe(48);
  });
});
