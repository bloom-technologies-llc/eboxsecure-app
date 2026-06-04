import { env } from "~/env";

const FROM =
  env.RESEND_FROM_EMAIL ?? "notifications@mailer.bloomtechnologies.co";

/** Send a shopper their one-time access code. */
export async function sendOtpEmail({
  to,
  code,
}: {
  to: string;
  code: string;
}): Promise<void> {
  const { Resend } = await import("resend");
  const resend = new Resend(env.RESEND_API_KEY);

  await resend.emails.send({
    from: FROM,
    to,
    subject: "Your EboxSecure verification code",
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #00698F;">Your Verification Code</h2>
          <p>Your EboxSecure verification code is:</p>
          <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #00698F; text-align: center; padding: 20px;">${code}</p>
          <p>This code expires in 10 minutes.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #999; font-size: 12px;">This is an automated notification from EboxSecure.</p>
        </body>
      </html>
    `,
  });
}

/**
 * Notify the ops inbox (e.g. a Shopify `customers/data_request` that needs
 * manual fulfillment). Best-effort: logs and swallows email errors so it never
 * turns a webhook 200 into a retry storm.
 */
export async function notifyOps(subject: string, body: string): Promise<void> {
  const to = env.RESEND_FROM_EMAIL ?? FROM;
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(env.RESEND_API_KEY);
    await resend.emails.send({ from: FROM, to, subject, text: body });
  } catch (error) {
    console.error("Failed to notify ops:", error);
  }
}
