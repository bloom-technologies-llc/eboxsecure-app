"use server";

import { z } from "zod";

const contactSchema = z.object({
  type: z.literal("contact"),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).optional(),
  company: z.string().trim().max(160).optional(),
  packageVolume: z.string().trim().max(40).optional(),
  challenges: z.string().trim().max(4000).optional(),
  contactMethod: z.string().trim().max(20).optional(),
});

const integrationRequestSchema = z.object({
  type: z.literal("integration-request"),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  storeName: z.string().trim().min(2).max(160),
  storeWebsite: z.string().trim().max(300).optional(),
  notes: z.string().trim().max(4000).optional(),
});

const inquirySchema = z.discriminatedUnion("type", [
  contactSchema,
  integrationRequestSchema,
]);

export type InquiryInput = z.infer<typeof inquirySchema>;

export interface InquiryResult {
  ok: boolean;
  error?: string;
}

const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  email: "Email",
  phone: "Phone",
  company: "Company",
  packageVolume: "Monthly package volume",
  challenges: "Current delivery challenges",
  contactMethod: "Preferred contact method",
  storeName: "Store requested",
  storeWebsite: "Store website",
  notes: "Notes",
};

const GENERIC_ERROR =
  "We couldn't send your message. Please try again in a few minutes.";

/**
 * Routes a marketing-site form submission (sales inquiry or "integrate with
 * this store" request) to the EboxSecure inbox via Resend.
 */
export async function submitInquiry(
  input: InquiryInput,
): Promise<InquiryResult> {
  const parsed = inquirySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check the form and try again." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.CONTACT_FORM_TO_EMAIL;
  if (!apiKey || !from || !to) {
    console.error(
      "submitInquiry: RESEND_API_KEY, RESEND_FROM_EMAIL and CONTACT_FORM_TO_EMAIL must all be set",
    );
    return { ok: false, error: GENERIC_ERROR };
  }

  const { type, ...fields } = parsed.data;
  const subject =
    type === "contact"
      ? `Sales inquiry from ${fields.name}`
      : `Store integration request: ${
          (fields as z.infer<typeof integrationRequestSchema>).storeName
        }`;

  const text = Object.entries(fields)
    .filter(([, value]) => typeof value === "string" && value.length > 0)
    .map(([key, value]) => `${FIELD_LABELS[key] ?? key}: ${value}`)
    .join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: fields.email,
        subject,
        text,
      }),
    });

    if (!response.ok) {
      console.error(
        "submitInquiry: Resend rejected the email",
        response.status,
        await response.text(),
      );
      return { ok: false, error: GENERIC_ERROR };
    }

    return { ok: true };
  } catch (error) {
    console.error("submitInquiry: failed to reach Resend", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}
