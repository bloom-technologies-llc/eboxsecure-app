import type { PrismaClient } from "@prisma/client";
import { beforeEach, describe, expect, it } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";

import { cancelEboxOrder } from "./cancel-order";

const db = mockDeep<PrismaClient>();
beforeEach(() => mockReset(db));

describe("cancelEboxOrder", () => {
  it("marks the matching Order cancelled with a reason and retains it", async () => {
    db.order.findUnique.mockResolvedValue({ id: 1001 } as never);
    db.order.update.mockResolvedValue({ id: 1001 } as never);

    const res = await cancelEboxOrder(
      { shopifyOrderId: "55001", cancelReason: "customer" },
      { db },
    );

    expect(res).toEqual({ result: "cancelled", orderId: 1001 });
    expect(db.order.delete).not.toHaveBeenCalled();
    const updateArg = db.order.update.mock.calls[0]?.[0] as {
      data: { cancelledAt: Date; cancelReason: string | null };
    };
    expect(updateArg.data.cancelReason).toBe("customer");
    expect(updateArg.data.cancelledAt).toBeInstanceOf(Date);
  });

  it("is a graceful no-op for an unknown order", async () => {
    db.order.findUnique.mockResolvedValue(null as never);
    const res = await cancelEboxOrder(
      { shopifyOrderId: "ghost", cancelReason: null },
      { db },
    );
    expect(res).toEqual({ result: "not-found" });
    expect(db.order.update).not.toHaveBeenCalled();
  });
});
