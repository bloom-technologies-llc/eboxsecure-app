import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { z } from "zod";

import { db } from "@ebox/db";
import { kv } from "@ebox/redis-client";

import { validateShopifyIntegrationKey } from "~/lib/shopify-integration-auth";

const VerifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export async function POST(request: Request) {
  const authError = validateShopifyIntegrationKey(request);
  if (authError) return authError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = VerifyOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { email, otp } = parsed.data;

  // Verify OTP from Redis
  const redisKey = `shopify-otp:${email.toLowerCase()}`;
  const storedOtp = await kv.get<string>(redisKey);

  if (!storedOtp || storedOtp !== otp) {
    return NextResponse.json(
      { error: "Invalid or expired verification code" },
      { status: 401 },
    );
  }

  // OTP is valid — delete it so it can't be reused
  await kv.del(redisKey);

  // Look up the customer
  const customer = await db.customerAccount.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true, email: true },
  });

  if (!customer) {
    return NextResponse.json(
      { error: "Customer not found" },
      { status: 404 },
    );
  }

  // Generate signed JWT (1-hour expiry)
  const jwtSecret = process.env.SHOPIFY_INTEGRATION_JWT_SECRET;
  if (!jwtSecret) {
    console.error("SHOPIFY_INTEGRATION_JWT_SECRET is not configured");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 },
    );
  }

  const secret = new TextEncoder().encode(jwtSecret);
  const token = await new SignJWT({
    customerId: customer.id,
    email: customer.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);

  return NextResponse.json({
    token,
    customerId: customer.id,
    email: customer.email,
  });
}
