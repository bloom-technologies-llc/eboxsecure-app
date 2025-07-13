import type { Prisma, PrismaClient } from "@prisma/client";
import { type inferProcedureInput } from "@trpc/server";
import { EncryptJWT } from "jose";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";

import { appRouter, AppRouter } from "../root";
import {
  createCallerFactory,
  createTRPCContext,
  NonMachineAuthObject,
} from "../trpc";

vi.mock("../../../db");

const db = mockDeep<PrismaClient>();

const getContext = () => {
  const session = {
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
  describe("authenticateAuthorizedPickupToken procedure", () => {
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
        AppRouter["auth"]["authenticateAuthorizedPickupToken"]
      >;
      const input: Input = {
        pickupToken: "test",
      };

      db.user.findUnique.mockResolvedValue({
        userType: "CORPORATE",
        id: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await expect(
        caller.auth.authenticateAuthorizedPickupToken(input),
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
        caller.auth.authenticateAuthorizedPickupToken(input),
      ).rejects.toThrowError(
        expect.objectContaining({
          code: "INTERNAL_SERVER_ERROR",
          message: "Server misconfiguration. Please contact support.",
        }),
      );

      vi.stubEnv("PICKUP_TOKEN_ISSUER", MOCK_PICKUP_TOKEN_ISSUER);

      await expect(
        caller.auth.authenticateAuthorizedPickupToken(input),
      ).rejects.toThrowError(
        expect.objectContaining({
          code: "INTERNAL_SERVER_ERROR",
          message: "Server misconfiguration. Please contact support.",
        }),
      );
    });
    it("should return unauthorized if code expires.", async () => {
      vi.useFakeTimers();
      const ctx = getContext();
      const caller = createCallerFactory(appRouter)({
        ...ctx,
        db,
      });

      type Input = inferProcedureInput<
        AppRouter["auth"]["authenticateAuthorizedPickupToken"]
      >;

      const secret = Buffer.from(MOCK_PICKUP_TOKEN_JWT_SECRET_KEY, "base64");

      const encryptedToken = await new EncryptJWT({
        sessionId: ctx.session.sessionId,
        orderId: 1,
      })
        .setProtectedHeader({ alg: "dir", enc: "A128CBC-HS256" })
        .setIssuedAt()
        .setIssuer(MOCK_PICKUP_TOKEN_ISSUER)
        .setAudience(MOCK_PICKUP_TOKEN_AUDIENCE)
        .setExpirationTime("15 mins")
        .encrypt(secret);

      const input: Input = {
        pickupToken: await encryptedToken,
      };

      db.user.findUnique.mockResolvedValue({
        userType: "CORPORATE",
        id: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.advanceTimersByTime(960000); //advance time 16 minutes
      await expect(
        caller.auth.authenticateAuthorizedPickupToken(input),
      ).resolves.toEqual({
        authorized: false,
        message: "QR Code Expired. Please create a new one and try again.",
      });
    });
    it("should throw error if QR code is invalid.", async () => {
      const ctx = getContext();
      const caller = createCallerFactory(appRouter)({
        ...ctx,
        db,
      });

      type Input = inferProcedureInput<
        AppRouter["auth"]["authenticateAuthorizedPickupToken"]
      >;

      const secret = Buffer.from(MOCK_PICKUP_TOKEN_JWT_SECRET_KEY, "base64");

      const encryptedToken = await new EncryptJWT({
        sessionId: ctx.session.sessionId,
        orderId: 1,
      })
        .setProtectedHeader({ alg: "dir", enc: "A128CBC-HS256" })
        .setIssuedAt()
        .setIssuer("WRONG_ISSUER")
        .setAudience(MOCK_PICKUP_TOKEN_AUDIENCE)
        .setExpirationTime("0s")
        .encrypt(secret);

      const input: Input = {
        pickupToken: await encryptedToken,
      };

      db.user.findUnique.mockResolvedValue({
        userType: "CORPORATE",
        id: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        caller.auth.authenticateAuthorizedPickupToken(input),
      ).rejects.toThrowError(
        expect.objectContaining({
          code: "BAD_REQUEST",
          message: "Invalid or corrupted QR code. Please try again.",
        }),
      );
    });
    it("should throw an error when no payload session is found.", async () => {
      vi.useFakeTimers();
      const ctx = getContext();
      const caller = createCallerFactory(appRouter)({
        ...ctx,
        db,
      });

      type Input = inferProcedureInput<
        AppRouter["auth"]["authenticateAuthorizedPickupToken"]
      >;

      const secret = Buffer.from(MOCK_PICKUP_TOKEN_JWT_SECRET_KEY, "base64");

      const encryptedToken = await new EncryptJWT({
        sessionId: ctx.session.sessionId,
        orderId: 1,
      })
        .setProtectedHeader({ alg: "dir", enc: "A128CBC-HS256" })
        .setIssuedAt()
        .setIssuer(MOCK_PICKUP_TOKEN_ISSUER)
        .setAudience(MOCK_PICKUP_TOKEN_AUDIENCE)
        .setExpirationTime("15 mins")
        .encrypt(secret);

      const input: Input = {
        pickupToken: await encryptedToken,
      };

      db.user.findUnique.mockResolvedValue({
        userType: "CORPORATE",
        id: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      db.session.findUnique.mockResolvedValue(null);

      await expect(
        caller.auth.authenticateAuthorizedPickupToken(input),
      ).rejects.toThrowError(
        expect.objectContaining({
          code: "UNAUTHORIZED",
          message: `Session not found.`,
        }),
      );
    });
    it("should throw an error when payload session is NOT active.", async () => {
      vi.useFakeTimers();
      const ctx = getContext();
      const caller = createCallerFactory(appRouter)({
        ...ctx,
        db,
      });

      type Input = inferProcedureInput<
        AppRouter["auth"]["authenticateAuthorizedPickupToken"]
      >;

      const secret = Buffer.from(MOCK_PICKUP_TOKEN_JWT_SECRET_KEY, "base64");

      const encryptedToken = await new EncryptJWT({
        sessionId: ctx.session.sessionId,
        orderId: 1,
      })
        .setProtectedHeader({ alg: "dir", enc: "A128CBC-HS256" })
        .setIssuedAt()
        .setIssuer(MOCK_PICKUP_TOKEN_ISSUER)
        .setAudience(MOCK_PICKUP_TOKEN_AUDIENCE)
        .setExpirationTime("15 mins")
        .encrypt(secret);

      const input: Input = {
        pickupToken: await encryptedToken,
      };

      db.user.findUnique.mockResolvedValue({
        userType: "CORPORATE",
        id: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      db.session.findUnique.mockResolvedValue({
        id: "mock-id",
        userId: "mock-user-id",
        status: "EXPIRED",
      });

      await expect(
        caller.auth.authenticateAuthorizedPickupToken(input),
      ).rejects.toThrowError(
        expect.objectContaining({
          code: "FORBIDDEN",
          message: "Session is not active.",
        }),
      );
    });
    it("should throw an error when no order is found.", async () => {
      vi.useFakeTimers();
      const ctx = getContext();
      const caller = createCallerFactory(appRouter)({
        ...ctx,
        db,
      });

      type Input = inferProcedureInput<
        AppRouter["auth"]["authenticateAuthorizedPickupToken"]
      >;

      const secret = Buffer.from(MOCK_PICKUP_TOKEN_JWT_SECRET_KEY, "base64");

      const encryptedToken = await new EncryptJWT({
        sessionId: ctx.session.sessionId,
        orderId: 1,
      })
        .setProtectedHeader({ alg: "dir", enc: "A128CBC-HS256" })
        .setIssuedAt()
        .setIssuer(MOCK_PICKUP_TOKEN_ISSUER)
        .setAudience(MOCK_PICKUP_TOKEN_AUDIENCE)
        .setExpirationTime("15 mins")
        .encrypt(secret);

      const input: Input = {
        pickupToken: await encryptedToken,
      };

      db.user.findUnique.mockResolvedValue({
        userType: "CORPORATE",
        id: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      db.session.findUnique.mockResolvedValue({
        id: "mock-id",
        userId: "mock-user-id",
        status: "ACTIVE",
      });

      db.order.findUnique.mockResolvedValue(null);

      await expect(
        caller.auth.authenticateAuthorizedPickupToken(input),
      ).rejects.toThrowError(
        expect.objectContaining({
          code: "NOT_FOUND",
          message: "Order not found.",
        }),
      );
    });
    it("should throw an error when order does not session user.", async () => {
      vi.useFakeTimers();
      const ctx = getContext();
      const caller = createCallerFactory(appRouter)({
        ...ctx,
        db,
      });

      type Input = inferProcedureInput<
        AppRouter["auth"]["authenticateAuthorizedPickupToken"]
      >;

      const secret = Buffer.from(MOCK_PICKUP_TOKEN_JWT_SECRET_KEY, "base64");

      const encryptedToken = await new EncryptJWT({
        sessionId: ctx.session.sessionId,
        orderId: 1,
      })
        .setProtectedHeader({ alg: "dir", enc: "A128CBC-HS256" })
        .setIssuedAt()
        .setIssuer(MOCK_PICKUP_TOKEN_ISSUER)
        .setAudience(MOCK_PICKUP_TOKEN_AUDIENCE)
        .setExpirationTime("15 mins")
        .encrypt(secret);

      const input: Input = {
        pickupToken: await encryptedToken,
      };

      db.user.findUnique.mockResolvedValue({
        userType: "CORPORATE",
        id: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      db.session.findUnique.mockResolvedValue({
        id: "mock-id",
        userId: "mock-user-id",
        status: "ACTIVE",
      });

      db.order.findUnique.mockResolvedValue({
        customerId: "diff-user-id",
        id: 0,
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

      await expect(
        caller.auth.authenticateAuthorizedPickupToken(input),
      ).rejects.toThrowError(
        expect.objectContaining({
          code: "UNAUTHORIZED",
          message: "Session does not match order owner.",
        }),
      );
    });
    it("should throw an error when order was already picked up.", async () => {
      vi.useFakeTimers();
      const ctx = getContext();
      const caller = createCallerFactory(appRouter)({
        ...ctx,
        db,
      });

      type Input = inferProcedureInput<
        AppRouter["auth"]["authenticateAuthorizedPickupToken"]
      >;

      const secret = Buffer.from(MOCK_PICKUP_TOKEN_JWT_SECRET_KEY, "base64");

      const encryptedToken = await new EncryptJWT({
        sessionId: ctx.session.sessionId,
        orderId: 1,
      })
        .setProtectedHeader({ alg: "dir", enc: "A128CBC-HS256" })
        .setIssuedAt()
        .setIssuer(MOCK_PICKUP_TOKEN_ISSUER)
        .setAudience(MOCK_PICKUP_TOKEN_AUDIENCE)
        .setExpirationTime("15 mins")
        .encrypt(secret);

      const input: Input = {
        pickupToken: await encryptedToken,
      };

      db.user.findUnique.mockResolvedValue({
        userType: "CORPORATE",
        id: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      db.session.findUnique.mockResolvedValue({
        id: "mock-id",
        userId: "mock-user-id",
        status: "ACTIVE",
      });

      db.order.findUnique.mockResolvedValue({
        customerId: "mock-user-id",
        id: 0,
        vendorOrderId: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        total: 0,
        shippedLocationId: 0,
        deliveredDate: null,
        pickedUpAt: new Date(),
        pickedUpById: "mock-user-id",
        processedAt: null,
        carrierId: null,
        meteredAt: null,
        meterEventId: null,
      });

      await expect(
        caller.auth.authenticateAuthorizedPickupToken(input),
      ).rejects.toThrowError(
        expect.objectContaining({
          code: "CONFLICT",
          message: "This order has already been picked up.",
        }),
      );
    });
    it("should throw an error when customer does not have a portrait Url.", async () => {
      vi.useFakeTimers();
      const ctx = getContext();
      const caller = createCallerFactory(appRouter)({
        ...ctx,
        db,
      });

      type Input = inferProcedureInput<
        AppRouter["auth"]["authenticateAuthorizedPickupToken"]
      >;

      const secret = Buffer.from(MOCK_PICKUP_TOKEN_JWT_SECRET_KEY, "base64");

      const encryptedToken = await new EncryptJWT({
        sessionId: ctx.session.sessionId,
        orderId: 1,
      })
        .setProtectedHeader({ alg: "dir", enc: "A128CBC-HS256" })
        .setIssuedAt()
        .setIssuer(MOCK_PICKUP_TOKEN_ISSUER)
        .setAudience(MOCK_PICKUP_TOKEN_AUDIENCE)
        .setExpirationTime("15 mins")
        .encrypt(secret);

      const input: Input = {
        pickupToken: await encryptedToken,
      };

      db.user.findUnique.mockResolvedValue({
        userType: "CORPORATE",
        id: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      db.session.findUnique.mockResolvedValue({
        id: "mock-id",
        userId: "mock-user-id",
        status: "ACTIVE",
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
        customer: {
          id: "1",
          subscription: null,
          firstName: "John",
          lastName: "Smith",
          email: "john@example.com",
          phoneNumber: null,
          shippingAddress: null,
          photoLink: null,
        },
      } as Prisma.OrderGetPayload<{ include: { customer: true } }>);

      await expect(
        caller.auth.authenticateAuthorizedPickupToken(input),
      ).rejects.toThrowError(
        expect.objectContaining({
          code: "FORBIDDEN",
          message:
            "User must upload a portrait before he or she can pick up a package.",
        }),
      );
    });
    it("should successfully return user name, portrait, and order ID.", async () => {
      vi.useFakeTimers();
      const ctx = getContext();
      const caller = createCallerFactory(appRouter)({
        ...ctx,
        db,
      });

      type Input = inferProcedureInput<
        AppRouter["auth"]["authenticateAuthorizedPickupToken"]
      >;

      const secret = Buffer.from(MOCK_PICKUP_TOKEN_JWT_SECRET_KEY, "base64");

      const encryptedToken = await new EncryptJWT({
        sessionId: ctx.session.sessionId,
        orderId: 1,
      })
        .setProtectedHeader({ alg: "dir", enc: "A128CBC-HS256" })
        .setIssuedAt()
        .setIssuer(MOCK_PICKUP_TOKEN_ISSUER)
        .setAudience(MOCK_PICKUP_TOKEN_AUDIENCE)
        .setExpirationTime("15 mins")
        .encrypt(secret);

      const input: Input = {
        pickupToken: await encryptedToken,
      };

      db.user.findUnique.mockResolvedValue({
        userType: "CORPORATE",
        id: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      db.session.findUnique.mockResolvedValue({
        id: "mock-id",
        userId: "mock-user-id",
        status: "ACTIVE",
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
        customer: {
          id: "1",
          subscription: null,
          firstName: "John",
          lastName: "Smith",
          email: "john@example.com",
          phoneNumber: null,
          shippingAddress: null,
          photoLink: "www.cdn.com/image",
        },
      } as Prisma.OrderGetPayload<{ include: { customer: true } }>);

      await expect(
        caller.auth.authenticateAuthorizedPickupToken(input),
      ).resolves.toEqual({
        authorized: true,
        orderId: 1,
        customerId: "mock-user-id",
        firstName: "John",
        lastName: "Smith",
        portraitUrl: "www.cdn.com/image",
      });
    });
  });
});
