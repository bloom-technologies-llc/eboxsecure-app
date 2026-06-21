import { createHmac } from "node:crypto";
import type { PrismaClient } from "@prisma/client";
import { beforeEach, describe, expect, it } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";

import { isDuplicate, recordWebhookEvent, verifyHmac } from "./webhook";

const db = mockDeep<PrismaClient>();
beforeEach(() => mockReset(db));

const SECRET = "test-shopify-secret";
const sign = (body: string) =>
  createHmac("sha256", SECRET).update(body, "utf8").digest("base64");

describe("verifyHmac", () => {
  const body = JSON.stringify({ id: 1, name: "#1001" });

  it("accepts a correct signature", () => {
    expect(verifyHmac(body, sign(body), SECRET)).toBe(true);
  });

  it("accepts when given the raw body as a Buffer", () => {
    expect(verifyHmac(Buffer.from(body, "utf8"), sign(body), SECRET)).toBe(true);
  });

  it("rejects a wrong signature", () => {
    expect(verifyHmac(body, sign(body + "tampered"), SECRET)).toBe(false);
  });

  it("rejects a malformed / wrong-length header", () => {
    expect(verifyHmac(body, "not-base64-hmac", SECRET)).toBe(false);
  });

  it("rejects a missing header", () => {
    expect(verifyHmac(body, null, SECRET)).toBe(false);
    expect(verifyHmac(body, undefined, SECRET)).toBe(false);
  });

  it("rejects when the secret is empty", () => {
    expect(verifyHmac(body, sign(body), "")).toBe(false);
  });
});

describe("isDuplicate", () => {
  it("returns true when the event id was already recorded", async () => {
    db.shopifyWebhookEvent.findUnique.mockResolvedValue({ id: "row-1" } as never);
    expect(await isDuplicate("evt-1", { db })).toBe(true);
  });

  it("returns false for a new event id", async () => {
    db.shopifyWebhookEvent.findUnique.mockResolvedValue(null as never);
    expect(await isDuplicate("evt-2", { db })).toBe(false);
  });
});

describe("recordWebhookEvent", () => {
  it("persists the event for future dedupe", async () => {
    db.shopifyWebhookEvent.create.mockResolvedValue({} as never);
    await recordWebhookEvent(
      { webhookEventId: "evt-3", topic: "orders/create", shop: "s.myshopify.com" },
      { db },
    );
    expect(db.shopifyWebhookEvent.create).toHaveBeenCalledWith({
      data: { webhookEventId: "evt-3", topic: "orders/create", shop: "s.myshopify.com" },
    });
  });
});
