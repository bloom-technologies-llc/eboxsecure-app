import type { PrismaClient } from "@prisma/client";
import { beforeEach, describe, expect, it } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";

import { applyFulfillment } from "./apply-fulfillment";

const db = mockDeep<PrismaClient>();
beforeEach(() => mockReset(db));

describe("applyFulfillment", () => {
  it("sets the tracking number and resolves the carrier by company name", async () => {
    db.order.findUnique.mockResolvedValue({ id: 1001, carrierId: null } as never);
    db.carrier.findFirst.mockResolvedValue({ id: 3 } as never);
    db.order.update.mockResolvedValue({ id: 1001 } as never);

    const res = await applyFulfillment(
      { shopifyOrderId: "55001", trackingNumber: "1Z999", trackingCompany: "UPS" },
      { db },
    );

    expect(res).toEqual({ result: "updated", orderId: 1001 });
    expect(db.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1001 },
        data: expect.objectContaining({ trackingNumber: "1Z999", carrierId: 3 }),
      }),
    );
  });

  it("does not overwrite an already-resolved carrier", async () => {
    db.order.findUnique.mockResolvedValue({ id: 1001, carrierId: 9 } as never);
    db.order.update.mockResolvedValue({ id: 1001 } as never);

    await applyFulfillment(
      { shopifyOrderId: "55001", trackingNumber: "1Z-NEW", trackingCompany: "FedEx" },
      { db },
    );

    expect(db.carrier.findFirst).not.toHaveBeenCalled();
    expect(db.order.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ carrierId: 9, trackingNumber: "1Z-NEW" }) }),
    );
  });

  it("is a graceful no-op for an unknown order", async () => {
    db.order.findUnique.mockResolvedValue(null as never);
    const res = await applyFulfillment(
      { shopifyOrderId: "does-not-exist", trackingNumber: "x", trackingCompany: null },
      { db },
    );
    expect(res).toEqual({ result: "not-found" });
    expect(db.order.update).not.toHaveBeenCalled();
  });
});
