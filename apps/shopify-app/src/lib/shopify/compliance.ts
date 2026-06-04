import type { Db } from "./types";

/**
 * Compliance / redaction handlers for Shopify's mandatory privacy webhooks
 * (ADR 0003). The guiding rule: scrub merchant-attributable identifiers but
 * retain our own operational records (the `Order` we custodied for our own
 * `CustomerAccount`, on our own lawful basis). We store almost no
 * merchant-provided PII, so redaction is a matter of nulling a few FKs.
 */

/**
 * `customers/redact` — null the merchant identifiers (`shopifyShop`,
 * `shopifyOrderId`) on that customer's `SHOPIFY` Orders. The `Order` and
 * `CustomerAccount` are retained. Customers link by email only.
 */
export async function redactCustomer(
  input: { customerEmail: string },
  deps: { db: Db },
): Promise<{ ordersScrubbed: number }> {
  const customer = await deps.db.customerAccount.findFirst({
    where: { email: { equals: input.customerEmail, mode: "insensitive" } },
    select: { id: true },
  });
  if (!customer) return { ordersScrubbed: 0 };

  const res = await deps.db.order.updateMany({
    where: { customerId: customer.id, sourceChannel: "SHOPIFY" },
    data: { shopifyShop: null, shopifyOrderId: null },
  });
  return { ordersScrubbed: res.count };
}

/**
 * `shop/redact` — delete the shop's session and webhook-event rows and
 * disassociate (but retain) its Orders by nulling their Shopify identifiers.
 */
export async function redactShop(
  input: { shop: string },
  deps: { db: Db },
): Promise<{ ordersScrubbed: number; sessionsDeleted: number; eventsDeleted: number }> {
  const sessions = await deps.db.shopifySession.deleteMany({
    where: { shop: input.shop },
  });
  const events = await deps.db.shopifyWebhookEvent.deleteMany({
    where: { shop: input.shop },
  });
  const orders = await deps.db.order.updateMany({
    where: { shopifyShop: input.shop },
    data: { shopifyShop: null, shopifyOrderId: null },
  });

  return {
    ordersScrubbed: orders.count,
    sessionsDeleted: sessions.count,
    eventsDeleted: events.count,
  };
}

/** `app/uninstalled` — delete the shop's stored OAuth session(s). */
export async function deleteShopSession(
  input: { shop: string },
  deps: { db: Db },
): Promise<{ sessionsDeleted: number }> {
  const res = await deps.db.shopifySession.deleteMany({
    where: { shop: input.shop },
  });
  return { sessionsDeleted: res.count };
}

/**
 * `customers/data_request` — record the request and notify ops for manual
 * fulfillment (no automated export tooling at this volume). The webhook is
 * already persisted by the dedupe layer; here we surface it to a human.
 */
export async function recordDataRequest(
  input: { shop: string; customerEmail: string | null; payload: unknown },
  deps: { notifyOps: (subject: string, body: string) => Promise<void> },
): Promise<void> {
  const subject = `Shopify data request — ${input.shop}`;
  const body = [
    `A customers/data_request webhook was received and needs manual fulfillment.`,
    `Shop: ${input.shop}`,
    `Customer email: ${input.customerEmail ?? "(not provided)"}`,
    `Payload: ${JSON.stringify(input.payload)}`,
  ].join("\n");

  await deps.notifyOps(subject, body);
}
