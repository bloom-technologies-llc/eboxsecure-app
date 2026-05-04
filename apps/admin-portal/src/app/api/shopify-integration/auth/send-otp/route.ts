import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@ebox/db";
import { kv } from "@ebox/redis-client";

import { validateShopifyIntegrationKey } from "~/lib/shopify-integration-auth";

const SendOtpSchema = z.object({
  email: z.string().email(),
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

  const parsed = SendOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { email } = parsed.data;

  // Check that a CustomerAccount with this email exists
  const customer = await db.customerAccount.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true, email: true },
  });

  if (!customer) {
    // Return success-like response to avoid email enumeration
    return NextResponse.json({ sent: true });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store in Redis with 10-minute TTL
  const redisKey = `shopify-otp:${email.toLowerCase()}`;
  await kv.set(redisKey, otp, { ex: 600 });

  // Send OTP via email using Resend
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        "notifications@mailer.bloomtechnologies.co",
      to: customer.email,
      subject: "Your EboxSecure verification code",
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #00698F;">Your Verification Code</h2>
            <p>Your EboxSecure verification code is:</p>
            <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #00698F; text-align: center; padding: 20px;">${otp}</p>
            <p>This code expires in 10 minutes.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="color: #999; font-size: 12px;">This is an automated notification from EboxSecure.</p>
          </body>
        </html>
      `,
    });
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    // Still return success — the OTP is in Redis for verification
  }

  return NextResponse.json({ sent: true });
}
