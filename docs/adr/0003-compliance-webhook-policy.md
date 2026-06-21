# Compliance webhooks: acknowledge, retain our records, scrub merchant identifiers

We implement the four Shopify compliance webhooks (`customers/data_request`,
`customers/redact`, `shop/redact`, `app/uninstalled`) with HMAC validation and 200
responses — required to keep the App Store listing. For the *data handling* we take the
lowest-effort path that is still compliant, which our model permits because the shopper is
always an existing EboxSecure `CustomerAccount`: we store almost no merchant-provided PII
(an `Order` holds a FK to our own customer plus order/shop identifiers; name and email
live on our own `CustomerAccount`).

- **`customers/data_request`** → record the request and notify ops for manual fulfillment;
  no automated export tooling.
- **`customers/redact`** → null the merchant-attributable fields (`shopifyShop`,
  `shopifyOrderId`) on that customer's `SHOPIFY` orders and log it; retain the `Order` and
  `CustomerAccount`.
- **`shop/redact`** → delete the shop's `shopify_session` and `ShopifyWebhookEvent` rows
  and null shopify identifiers on its orders; retain the orders.
- **`app/uninstalled`** → delete the shop's session.

**Why:** The `Order` is our own operational record of a package we physically custodied for
our own customer, retained on our own lawful basis; deleting it would corrupt our
customers' Ebox order history for no compliance gain. Automated export tooling is
unwarranted at current volume.

**Considered and rejected:** Deleting `Order`s/`CustomerAccount`s on redact (destroys our
own legitimate records); building an automated data-export portal (effort unjustified at
this volume).

**Consequences:** Compliance rests on EboxSecure having an independent lawful basis to
retain the customer as their service provider — a privacy reviewer should confirm that
basis. `data_request` fulfillment needs a named owner and a short runbook.
