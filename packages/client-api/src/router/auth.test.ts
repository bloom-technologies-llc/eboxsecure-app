import type { PrismaClient } from "@prisma/client";
import { inferProcedureInput } from "@trpc/server";
import { jwtDecrypt } from "jose";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";

import { AppRouter, appRouter } from "../root";
import {
  createCallerFactory,
  createTRPCContext,
  NonMachineAuthObject,
} from "../trpc";
import { AuthorizedPickupTokenPayload } from "./auth";

vi.mock("../../../db");
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({}),
    },
  })),
}));

const db = mockDeep<PrismaClient>();

const getContext = () => {
  const session = {
    sessionId: "mock-session-id",
    userId: "mock-user",
  } as NonMachineAuthObject;
  const opts = {
    session,
    headers: {
      get: (_name: string) => null,
    } as Headers,
  };
  return createTRPCContext(opts);
};

const MOCK_PICKUP_TOKEN_JWT_SECRET_KEY =
  "4+UFTKYFWGYgyZ51NgufeXaq9XCFqBunYe3N4JfLQrQ=";
const MOCK_PICKUP_TOKEN_AUDIENCE = "audience";
const MOCK_PICKUP_TOKEN_ISSUER = "issuer";

describe("auth router", () => {
  describe("getAuthorizedPickupToken procedure", () => {
    beforeEach(() => {
      vi.stubEnv(
        "PICKUP_TOKEN_JWT_SECRET_KEY",
        MOCK_PICKUP_TOKEN_JWT_SECRET_KEY,
      );
      vi.stubEnv("PICKUP_TOKEN_ISSUER", MOCK_PICKUP_TOKEN_ISSUER);
      vi.stubEnv("PICKUP_TOKEN_AUDIENCE", MOCK_PICKUP_TOKEN_AUDIENCE);
    });
    it("should throw an error when environment variables are not defined.", async () => {
      vi.unstubAllEnvs();

      const ctx = getContext();
      const caller = createCallerFactory(appRouter)({
        ...ctx,
        db,
      });

      type Input = inferProcedureInput<
        AppRouter["auth"]["getAuthorizedPickupToken"]
      >;
      const input: Input = {
        orderId: 1,
      };

      db.user.findUnique.mockResolvedValue({
        userType: "CUSTOMER",
        id: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        caller.auth.getAuthorizedPickupToken(input),
      ).rejects.toThrowError(
        expect.objectContaining({
          code: "INTERNAL_SERVER_ERROR",
          message: "Server misconfiguration. Please contact support.",
        }),
      );
      vi.stubEnv(
        "PICKUP_TOKEN_JWT_SECRET_KEY",
        MOCK_PICKUP_TOKEN_JWT_SECRET_KEY,
      );
      await expect(
        caller.auth.getAuthorizedPickupToken(input),
      ).rejects.toThrowError(
        expect.objectContaining({
          code: "INTERNAL_SERVER_ERROR",
          message: "Server misconfiguration. Please contact support.",
        }),
      );

      vi.stubEnv("PICKUP_TOKEN_ISSUER", MOCK_PICKUP_TOKEN_ISSUER);

      await expect(
        caller.auth.getAuthorizedPickupToken(input),
      ).rejects.toThrowError(
        expect.objectContaining({
          code: "INTERNAL_SERVER_ERROR",
          message: "Server misconfiguration. Please contact support.",
        }),
      );
    });
    it("should throw an error if no order is found.", async () => {
      const ctx = getContext();
      const caller = createCallerFactory(appRouter)({
        ...ctx,
        db,
      });

      type Input = inferProcedureInput<
        AppRouter["auth"]["getAuthorizedPickupToken"]
      >;
      const input: Input = {
        orderId: 1,
      };

      db.user.findUnique.mockResolvedValue({
        userType: "CUSTOMER",
        id: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      db.order.findUnique.mockResolvedValue(null);
      await expect(
        caller.auth.getAuthorizedPickupToken(input),
      ).rejects.toThrowError(
        expect.objectContaining({
          code: "NOT_FOUND",
          message: `Order ID ${input.orderId} not found in database as valid order.`,
        }),
      );
    });
    it("should throw an error if no order was already picked up.", async () => {
      const ctx = getContext();
      const caller = createCallerFactory(appRouter)({
        ...ctx,
        db,
      });

      type Input = inferProcedureInput<
        AppRouter["auth"]["getAuthorizedPickupToken"]
      >;
      const input: Input = {
        orderId: 1,
      };

      db.user.findUnique.mockResolvedValue({
        userType: "CUSTOMER",
        id: "mock-user-id",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      db.order.findUnique.mockResolvedValue({
        customerId: "mock-user-id",
        id: 1,
        vendorOrderId: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        total: 0,
        shippedLocationId: 0,
        deliveredDate: null,
        pickedUpAt: new Date(),
        pickedUpById: null,
        processedAt: null,
        carrierId: null,
        meteredAt: null,
        meterEventId: null,
      });

      await expect(
        caller.auth.getAuthorizedPickupToken(input),
      ).rejects.toThrowError(
        expect.objectContaining({
          code: "CONFLICT",
          message: `Order ID ${input.orderId} was already picked up.`,
        }),
      );
    });
    it("should return a encrypted token for QR code.", async () => {
      const ctx = getContext();
      const caller = createCallerFactory(appRouter)({
        ...ctx,
        db,
      });

      type Input = inferProcedureInput<
        AppRouter["auth"]["getAuthorizedPickupToken"]
      >;
      const input: Input = {
        orderId: 1,
      };

      db.user.findUnique.mockResolvedValue({
        userType: "CUSTOMER",
        id: "mock-user-id",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      db.order.findUnique.mockResolvedValue({
        customerId: "mock-user-id",
        id: 1,
        vendorOrderId: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        total: 0,
        shippedLocationId: 0,
        deliveredDate: null,
        pickedUpAt: null,
        pickedUpById: null,
        processedAt: null,
        carrierId: null,
        meteredAt: null,
        meterEventId: null,
      });

      const token = await caller.auth.getAuthorizedPickupToken(input);
      const secret = Buffer.from(MOCK_PICKUP_TOKEN_JWT_SECRET_KEY, "base64");
      await expect(
        jwtDecrypt<AuthorizedPickupTokenPayload>(token, secret, {
          issuer: MOCK_PICKUP_TOKEN_ISSUER,
          audience: MOCK_PICKUP_TOKEN_AUDIENCE,
        }),
      ).resolves.toBeTruthy();
    });
  });
});
