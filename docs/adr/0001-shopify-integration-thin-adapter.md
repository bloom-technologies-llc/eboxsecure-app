# Shopify integration is a thin adapter over the EboxSecure Order

The approved POC (`ebox-shopify-app-poc`) kept its own Postgres mirror of every Shopify
order, customer, line item, and fulfillment. We are replacing that with a thin adapter:
only checkouts where the shopper selects an Ebox locker — signalled by the
`ebox.eboxOrder` metafield set by the checkout extension — create an EboxSecure `Order`
(`sourceChannel = SHOPIFY`) in the shared `@ebox/db`, which remains the single source of
truth that ties scanning, pickup, and notifications together. The mirror tables
(LineItem, Fulfillment, FulfillmentEvent, OrderMetafield, app-local Customer/User) are
dropped.

**Why:** The monorepo `Order` already ties the whole app together; a second mirror would
duplicate identity and order state and create ongoing reconciliation burden. Physical
arrival at a locker is already authoritative via the existing scanner reconciliation
(`packages/admin-api` `scanner.ts`), so a full Shopify order/fulfillment replica buys us
nothing.

**Considered and rejected:** Keeping the self-contained mirror and having the monorepo
read from it — rejected because it creates two sources of truth for the same order and
no consumer needs the extra Shopify detail.

**Consequences:** Shopify Orders without the metafield are ignored entirely. The
integration depends on (1) the metafield being reliably present on the order webhook,
and (2) the shopper already having a `CustomerAccount` — both resolved in later
decisions.
