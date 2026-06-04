import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@ebox/db";
import { kv } from "@ebox/redis-client";

import { env } from "~/env";
import { rateLimit } from "~/lib/shopify/rate-limit";
import { OtpError, verifyOtp } from "~/lib/shopify/otp";

export const runtime = "nodejs";

const VerifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = VerifyOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { email, otp } = parsed.data;

  // Brute-force protection: per-email window on verification attempts.
  const limit = await rateLimit(kv, `verify-otp:email:${email.toLowerCase()}`, {
    limit: 10,
    windowSeconds: 600,
  });
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  try {
    const { token, customerId } = await verifyOtp(email, otp, {
      db,
      redis: kv,
      jwtSecret: env.SHOPIFY_INTEGRATION_JWT_SECRET,
    });
    return NextResponse.json({ token, customerId });
  } catch (error) {
    if (error instanceof OtpError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    throw error;
  }
}
