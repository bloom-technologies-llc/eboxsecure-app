import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@ebox/db";
import { kv } from "@ebox/redis-client";

import { sendOtpEmail } from "~/lib/email";
import { sendOtp } from "~/lib/shopify/otp";
import { rateLimit } from "~/lib/shopify/rate-limit";

export const runtime = "nodejs";

const SendOtpSchema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = SendOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { email } = parsed.data;

  // Code-spam protection: per-email and per-IP fixed windows.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const [perEmail, perIp] = await Promise.all([
    rateLimit(kv, `send-otp:email:${email.toLowerCase()}`, {
      limit: 5,
      windowSeconds: 600,
    }),
    rateLimit(kv, `send-otp:ip:${ip}`, { limit: 20, windowSeconds: 600 }),
  ]);
  if (!perEmail.allowed || !perIp.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const result = await sendOtp(email, {
    db,
    redis: kv,
    sendEmail: sendOtpEmail,
  });

  if (!result.accountExists) {
    // Relaxed anti-enumeration: tell the shopper to sign up rather than leave
    // them waiting for a code that will never arrive.
    return NextResponse.json({
      sent: false,
      accountExists: false,
      message:
        "No EboxSecure account found for this email. Please sign up first.",
    });
  }

  return NextResponse.json({ sent: true, accountExists: true });
}
