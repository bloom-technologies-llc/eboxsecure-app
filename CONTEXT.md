# Shopify Integration

How a purchase in a partner merchant's Shopify store becomes an EboxSecure pickup
order. This is the first bounded context documented in this monorepo; if others are
documented later, promote this file to a `CONTEXT-MAP.md`.

The integration spans three places: `apps/shopify-app` (the Shopify-facing app +
checkout extension), `apps/admin-portal` (currently hosts the data endpoints), and
`packages/db` (the shared `Order` it writes into).

## Language

**Order**:
The EboxSecure record of a package bound for an Ebox locker — the central object that
ties scanning, pickup, and notifications together (`@ebox/db` `Order`).
_Avoid_: "pickup order", "monorepo order".

**Shopify Order**:
An order in a partner merchant's Shopify store. Becomes an **Order** only when the
shopper chose Ebox locker delivery at checkout.
_Avoid_: using bare "order" for this.

**Source Channel**:
How an **Order** was created — `SHOPIFY` (created at checkout via this integration, then
later scanned on arrival) or `SCAN` (created at the moment of scanning, for **Virtual
address** packages that have no upstream record).

**Scan**:
The physical receipt of a package at a **Location**. For a `SHOPIFY` **Order** it marks
the existing record processed/delivered and notifies the **CustomerAccount**; for a
**Virtual address** package it creates the `SCAN` **Order** outright.

**Virtual address**:
An EboxSecure-provided shipping address a **CustomerAccount** can use at stores that have
*not* installed this integration. Such packages have no checkout webhook, so their
**Order** is created at **Scan** time.

**Ebox metafield**:
The `ebox.eboxOrder` order metafield the checkout extension writes when a shopper selects
an Ebox locker. Its presence marks a **Shopify Order** for ingestion, and it carries the
chosen **Location** id and the authenticated **CustomerAccount** id so ingestion is
deterministic (no address matching). Written client-side, so its IDs are validated for
existence at ingestion, not trusted.
_Avoid_: "order metafield".

**Location**:
An EboxSecure pickup point where packages are delivered and collected (`@ebox/db`
`Location`).
_Avoid_: "store", "warehouse", "Ebox locker" (informal).

**CustomerAccount**:
An EboxSecure customer identity (`@ebox/db` `CustomerAccount`); the shopper
authenticates against it via OTP to use lockers.
_Avoid_: "user", "account".

**Shopify Customer**:
The customer record in the merchant's Shopify store; distinct from a **CustomerAccount**
and linked only by email.
_Avoid_: conflating with **CustomerAccount**.

**Shop**:
A partner merchant's Shopify store (`*.myshopify.com`), identified by its domain and
stored on **Order** as `shopifyShop`.

## Relationships

- A **Shopify Order** carrying the **Ebox metafield** produces exactly one **Order**
  (`sourceChannel = SHOPIFY`).
- An **Order** is delivered to one **Location** and belongs to one **CustomerAccount**.
- A **CustomerAccount** is matched to a **Shopify Customer** by email.
- Locker-at-checkout is available only to shoppers who **already** have a
  **CustomerAccount** (matched by email); the integration never creates accounts. A
  shopper with no match is told to sign up — we deliberately do not preserve strict
  email-enumeration secrecy at checkout.
- A **Shop** is installed by a merchant via OAuth and emits the webhooks that drive
  **Order** creation and updates.
- A `SHOPIFY` **Order** is created at checkout with no delivery yet; **scanning** it
  later marks it processed/delivered and notifies the **CustomerAccount** — it does not
  create a second **Order**.
- A `SCAN` **Order** (a **Virtual address** package) is created at **Scan** time, since
  no upstream checkout record exists.
- A **Scan** is matched to its `SHOPIFY` **Order** by tracking number, so tracking must
  be attached (via the fulfillment webhook) before the package is scanned.
- A cancelled **Shopify Order** marks its **Order** cancelled (a `cancelledAt` timestamp);
  the **Order** is never auto-deleted.
- A package that reaches a **Location** with no matching `SHOPIFY` **Order** (e.g. a
  merchant fulfilled without a tracking number) is flagged for manual reconciliation
  rather than silently creating a duplicate `SCAN` **Order**.

## Example dialogue

> **Dev:** "A shopper buys socks, ships to their home, never touches the Ebox toggle.
> Do we create an **Order**?"
> **Domain expert:** "No. Only a locker-opted-in checkout — one carrying the **Ebox
> metafield** — becomes an **Order**. A home-delivery **Shopify Order** never enters
> EboxSecure."
> **Dev:** "When we physically scan a package, do we always create an **Order**?"
> **Domain expert:** "Only for **Virtual address** packages — they have no upstream
> record, so the **Scan** creates the `SCAN` **Order**. A Shopify package already has its
> **Order** from checkout, so the **Scan** just marks it processed and notifies the
> customer."

## Flagged ambiguities

- "Order" was used for three things — the merchant's store order, the POC's local
  mirror copy, and the EboxSecure record. Resolved: **Order** is the EboxSecure record;
  the external one is a **Shopify Order**; the POC's mirror is eliminated.
- "Customer" / "user" / "account" were overloaded. Resolved: **CustomerAccount** (Ebox
  identity) vs **Shopify Customer** (merchant store), linked by email only.
- "Created at scan" applies only to **Virtual address** (`SCAN`) orders. A `SHOPIFY`
  **Order** is created at checkout; the **Scan** only updates it.
