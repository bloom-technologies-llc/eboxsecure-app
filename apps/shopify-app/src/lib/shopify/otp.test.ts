import type { PrismaClient } from "@prisma/client";
import { jwtVerify, SignJWT } from "jose";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";

import type { RedisLike } from "./types";
import { OtpError, sendOtp, verifyOtp, verifyShopperToken } from "./otp";

const db = mockDeep<PrismaClient>();

const makeRedis = (): RedisLike & {
  set: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
  del: ReturnType<typeof vi.fn>;
} => ({
  set: vi.fn().mockResolvedValue("OK"),
  get: vi.fn().mockResolvedValue(null),
  del: vi.fn().mockResolvedValue(1),
  incr: vi.fn().mockResolvedValue(1),
  expire: vi.fn().mockResolvedValue(1),
});

const JWT_SECRET = "test-jwt-secret-which-is-long-enough";

let redis: ReturnType<typeof makeRedis>;
beforeEach(() => {
  mockReset(db);
  redis = makeRedis();
});

describe("sendOtp", () => {
  it("generates, stores (10-min TTL) and emails a 6-digit code for an existing account", async () => {
    db.customerAccount.findFirst.mockResolvedValue({
      id: "cust_1",
      email: "a@b.com",
    } as never);
    const sendEmail = vi.fn().mockResolvedValue(undefined);

    const res = await sendOtp("A@B.com", { db, redis, sendEmail });

    expect(res).toEqual({ accountExists: true });
    expect(redis.set).toHaveBeenCalledTimes(1);
    const [key, code, opts] = redis.set.mock.calls[0] as [
      string,
      string,
      { ex: number },
    ];
    expect(key).toBe("shopify-otp:a@b.com");
    expect(code).toMatch(/^\d{6}$/);
    expect(opts).toEqual({ ex: 600 });
    expect(sendEmail).toHaveBeenCalledWith({ to: "a@b.com", code });
  });

  it("reports no account (relaxed anti-enumeration) without storing or emailing", async () => {
    db.customerAccount.findFirst.mockResolvedValue(null as never);
    const sendEmail = vi.fn().mockResolvedValue(undefined);

    const res = await sendOtp("nobody@b.com", { db, redis, sendEmail });

    expect(res).toEqual({ accountExists: false });
    expect(redis.set).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });
});

describe("verifyOtp", () => {
  it("issues a 1h JWT carrying the customerId and burns the code (single-use)", async () => {
    redis.get.mockResolvedValue("123456");
    db.customerAccount.findFirst.mockResolvedValue({
      id: "cust_1",
      email: "a@b.com",
    } as never);

    const { token, customerId } = await verifyOtp("a@b.com", "123456", {
      db,
      redis,
      jwtSecret: JWT_SECRET,
    });

    expect(customerId).toBe("cust_1");
    expect(redis.del).toHaveBeenCalledWith("shopify-otp:a@b.com");

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET),
    );
    expect(payload.customerId).toBe("cust_1");
    expect(payload.exp).toBeDefined();
  });

  it("matches a code that Upstash deserialized back to a number", async () => {
    // Upstash JSON-parses GET results, so a stored numeric string like "523198"
    // returns as the number 523198. verifyOtp must still match it.
    redis.get.mockResolvedValue(523198 as never);
    db.customerAccount.findFirst.mockResolvedValue({
      id: "cust_1",
      email: "a@b.com",
    } as never);

    const { customerId } = await verifyOtp("a@b.com", "523198", {
      db,
      redis,
      jwtSecret: JWT_SECRET,
    });

    expect(customerId).toBe("cust_1");
    expect(redis.del).toHaveBeenCalledWith("shopify-otp:a@b.com");
  });

  it("rejects a wrong code and does not burn it", async () => {
    redis.get.mockResolvedValue("123456");
    await expect(
      verifyOtp("a@b.com", "000000", { db, redis, jwtSecret: JWT_SECRET }),
    ).rejects.toBeInstanceOf(OtpError);
    expect(redis.del).not.toHaveBeenCalled();
  });

  it("rejects an expired/missing code", async () => {
    redis.get.mockResolvedValue(null);
    await expect(
      verifyOtp("a@b.com", "123456", { db, redis, jwtSecret: JWT_SECRET }),
    ).rejects.toBeInstanceOf(OtpError);
  });

  it("rejects when the account vanished after the code was issued", async () => {
    redis.get.mockResolvedValue("123456");
    db.customerAccount.findFirst.mockResolvedValue(null as never);
    await expect(
      verifyOtp("a@b.com", "123456", { db, redis, jwtSecret: JWT_SECRET }),
    ).rejects.toBeInstanceOf(OtpError);
  });
});

describe("verifyShopperToken", () => {
  const sign = (claims: Record<string, unknown>, secret = JWT_SECRET) =>
    new SignJWT(claims)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode(secret));

  it("returns the claims for a valid shopper token", async () => {
    const token = await sign({ customerId: "cust_1", email: "a@b.com" });
    const claims = await verifyShopperToken(token, JWT_SECRET);
    expect(claims).toEqual({ customerId: "cust_1", email: "a@b.com" });
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await sign(
      { customerId: "cust_1" },
      "a-totally-different-secret",
    );
    await expect(verifyShopperToken(token, JWT_SECRET)).rejects.toBeInstanceOf(
      OtpError,
    );
  });

  it("rejects a malformed token", async () => {
    await expect(
      verifyShopperToken("not-a-jwt", JWT_SECRET),
    ).rejects.toBeInstanceOf(OtpError);
  });

  it("rejects a token with no customerId claim", async () => {
    const token = await sign({ email: "a@b.com" });
    await expect(verifyShopperToken(token, JWT_SECRET)).rejects.toBeInstanceOf(
      OtpError,
    );
  });
});
