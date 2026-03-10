import Twilio from "twilio";

let twilioClient: Twilio.Twilio | null = null;

function getTwilioClient(): Twilio.Twilio | null {
  if (twilioClient) return twilioClient;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    return null;
  }

  twilioClient = Twilio(accountSid, authToken);
  return twilioClient;
}

export async function sendSms(
  to: string,
  message: string,
): Promise<void> {
  const client = getTwilioClient();
  if (!client) {
    console.warn("Twilio not configured, skipping SMS");
    return;
  }

  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!from) {
    console.warn("TWILIO_PHONE_NUMBER not set, skipping SMS");
    return;
  }

  try {
    await client.messages.create({ body: message, from, to });
  } catch (error) {
    console.error("Failed to send SMS:", error);
  }
}
