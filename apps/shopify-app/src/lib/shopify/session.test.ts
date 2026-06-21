import type { PrismaClient } from "@prisma/client";
import { beforeEach, describe, expect, it } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";

import {
  deleteSessionsForShop,
  loadSessionByShop,
  offlineSessionId,
  storeSession,
} from "./session";

const db = mockDeep<PrismaClient>();
beforeEach(() => mockReset(db));

const SHOP = "acme.myshopify.com";

describe("offlineSessionId", () => {
  it("is deterministic per shop", () => {
    expect(offlineSessionId(SHOP)).toBe("offline_acme.myshopify.com");
  });
});

describe("storeSession", () => {
  it("upserts an offline session keyed by the deterministic id", async () => {
    db.shopifySession.upsert.mockResolvedValue({} as never);

    await storeSession(
      {
        shop: SHOP,
        state: "nonce",
        scope: "read_orders",
        accessToken: "shpat_x",
      },
      { db },
    );

    expect(db.shopifySession.upsert).toHaveBeenCalledTimes(1);
    const arg = db.shopifySession.upsert.mock.calls[0]![0];
    expect(arg.where).toEqual({ id: "offline_acme.myshopify.com" });
    expect(arg.create).toMatchObject({
      id: "offline_acme.myshopify.com",
      shop: SHOP,
      state: "nonce",
      isOnline: false,
      scope: "read_orders",
      accessToken: "shpat_x",
      expires: null,
    });
    expect(arg.update).toMatchObject({
      shop: SHOP,
      scope: "read_orders",
      accessToken: "shpat_x",
      isOnline: false,
    });
  });
});

describe("loadSessionByShop", () => {
  it("returns the most recent offline session for a shop", async () => {
    db.shopifySession.findFirst.mockResolvedValue({
      id: "offline_acme.myshopify.com",
      shop: SHOP,
      scope: "read_orders",
      accessToken: "shpat_x",
      state: "nonce",
    } as never);

    const result = await loadSessionByShop(SHOP, { db });

    expect(result?.accessToken).toBe("shpat_x");
    expect(db.shopifySession.findFirst).toHaveBeenCalledWith({
      where: { shop: SHOP, isOnline: false },
      orderBy: { id: "desc" },
      select: {
        id: true,
        shop: true,
        scope: true,
        accessToken: true,
        state: true,
      },
    });
  });

  it("returns null when no session exists", async () => {
    db.shopifySession.findFirst.mockResolvedValue(null as never);
    expect(await loadSessionByShop(SHOP, { db })).toBeNull();
  });
});

describe("deleteSessionsForShop", () => {
  it("deletes by shop (consistent with compliance/uninstall) and reports the count", async () => {
    db.shopifySession.deleteMany.mockResolvedValue({ count: 2 } as never);

    const result = await deleteSessionsForShop(SHOP, { db });

    expect(result).toEqual({ sessionsDeleted: 2 });
    expect(db.shopifySession.deleteMany).toHaveBeenCalledWith({
      where: { shop: SHOP },
    });
  });
});
