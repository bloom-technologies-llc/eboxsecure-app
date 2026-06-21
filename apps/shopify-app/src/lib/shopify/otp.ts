import { randomInt } from "node:crypto";
import { jwtVerify, SignJWT } from "jose";

import type { Db, RedisLike } from "./types";

const OTP_TTL_SECONDS = 600; // 10 minutes
const JWT_TTL = "1h";

const otpKey = (email: string) => `shopify-otp:${email.toLowerCase()}`;

export interface OtpDeps {
  db: Db;
  redis: RedisLike;
  /** Sends the code to the shopper (Resend in production; a spy in tests). */
  sendEmail: (params: { to: string; code: string }) => Promise<void>;
}

export type SendOtpResult = { accountExists: true } | { accountExists: false };

/**
 * Look up an existing `CustomerAccount` by email (case-insensitive); if found,
 * generate a single-use 6-digit code, store it in Redis with a 10-minute TTL,
 * and email it. Accounts are never created here.
 *
 * Anti-enumeration is deliberately relaxed (ADR/PRD): a shopper with no account
 * is told to sign up rather than silently dropped, so they aren't left waiting
 * for a code that never arrives. The caller surfaces `accountExists`.
 */
export async function sendOtp(
  email: string,
  deps: OtpDeps,
): Promise<SendOtpResult> {
  const customer = await deps.db.customerAccount.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true, email: true },
  });

  if (!customer) return { accountExists: false };

  // crypto.randomInt is uniform and unpredictable, unlike Math.random.
  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");

  await deps.redis.set(otpKey(email), code, { ex: OTP_TTL_SECONDS });
  await deps.sendEmail({ to: customer.email, code });

  return { accountExists: true };
}

export class OtpError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OtpError";
  }
}

export interface VerifyOtpDeps extends Pick<OtpDeps, "db" | "redis"> {
  jwtSecret: string;
}

export interface VerifyOtpResult {
  token: string;
  customerId: string;
}

/**
 * Validate a code against Redis and, on success, delete it (single-use) and
 * issue a 1-hour HS256 JWT carrying the `customerId`. Wrong/expired codes and
 * unknown accounts throw `OtpError` for the route to translate to a clear 401.
 */
export async function verifyOtp(
  email: string,
  otp: string,
  deps: VerifyOtpDeps,
): Promise<VerifyOtpResult> {
  const stored = await deps.redis.get<string>(otpKey(email));
  if (!stored || stored !== otp) {
    throw new OtpError("Invalid or expired verification code");
  }

  // Single-use: burn the code before issuing a token so it can't be replayed.
  await deps.redis.del(otpKey(email));

  const customer = await deps.db.customerAccount.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true, email: true },
  });
  if (!customer) throw new OtpError("No account found for this email");

  const secret = new TextEncoder().encode(deps.jwtSecret);
  const token = await new SignJWT({
    customerId: customer.id,
    email: customer.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_TTL)
    .sign(secret);

  return { token, customerId: customer.id };
}

export interface ShopperClaims {
  customerId: string;
  email?: string;
}

/**
 * Verify a shopper JWT issued by {@link verifyOtp} (HS256, 1h). Returns the
 * claims on success; throws {@link OtpError} for a missing/tampered/expired
 * token so route handlers can answer 401 uniformly. Used to gate the locations
 * endpoint to authenticated shoppers.
 */
export async function verifyShopperToken(
  token: string,
  jwtSecret: string,
): Promise<ShopperClaims> {
  const secret = new TextEncoder().encode(jwtSecret);
  try {
    const { payload } = await jwtVerify(token, secret);
    const customerId =
      typeof payload.customerId === "string" ? payload.customerId : "";
    if (!customerId) throw new OtpError("Invalid token");
    const email = typeof payload.email === "string" ? payload.email : undefined;
    return { customerId, email };
  } catch (err) {
    if (err instanceof OtpError) throw err;
    throw new OtpError("Invalid or expired token");
  }
}
