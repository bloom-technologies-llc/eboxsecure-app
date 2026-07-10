import { db } from "@ebox/db";

import { isValidShopDomain } from "~/lib/shopify/oauth";
import { loadSessionByShop } from "~/lib/shopify/session";
import { InstallBootstrap } from "./InstallBootstrap";

export const runtime = "nodejs";

/**
 * Webhook + GDPR topics registered in `shopify.app.toml`, surfaced statically so
 * a merchant can eyeball that the app is wired up. Kept in sync by hand with the
 * toml (the source of truth Shopify reads at `app deploy`).
 */
const REGISTERED_WEBHOOKS = [
  "orders/create",
  "orders/cancelled",
  "fulfillments/create",
  "fulfillments/update",
  "app/uninstalled",
];
const GDPR_WEBHOOKS = [
  "customers/data_request",
  "customers/redact",
  "shop/redact",
];

/**
 * Embedded status page (server component). Reports whether the shop in `?shop=`
 * has a stored offline access token. When it doesn't yet, it mounts
 * `InstallBootstrap`, which completes the managed install via App Bridge token
 * exchange (App Bridge itself is loaded in `layout.tsx`). Resilient by design:
 * no shop, an invalid shop, or a missing session all render a clear state
 * instead of throwing.
 */
export default async function StatusPage({
  searchParams,
}: {
  searchParams: { shop?: string; host?: string };
}) {
  const shopParam = searchParams.shop;
  const host = searchParams.host;
  const shop = isValidShopDomain(shopParam) ? shopParam : null;

  const session = shop
    ? await loadSessionByShop(shop, { db }).catch(() => null)
    : null;
  const connected = Boolean(session?.accessToken);

  return (
    <main
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        maxWidth: 640,
        margin: "0 auto",
        padding: "2rem 1.5rem",
        lineHeight: 1.5,
      }}
    >
      <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>EboxSecure</h1>
      <p style={{ color: "#555", marginTop: 0 }}>
        Locker fulfillment for your Shopify store.
      </p>

      <section style={{ marginTop: "1.5rem" }}>
        <h2 style={{ fontSize: "1.1rem" }}>Connection</h2>
        {!shop ? (
          <p>No store specified. Open this app from your Shopify admin.</p>
        ) : connected ? (
          <p>
            <strong style={{ color: "#0a7d28" }}>Connected</strong> — {shop} has
            authorized EboxSecure.
            <br />
            Granted scopes: <code>{session?.scope ?? "(none recorded)"}</code>
          </p>
        ) : (
          <>
            <p>
              <strong style={{ color: "#b25000" }}>Not connected</strong> —
              finishing installation for {shop}…
            </p>
            <InstallBootstrap connected={connected} embedded={Boolean(host)} />
          </>
        )}
      </section>

      <section style={{ marginTop: "1.5rem" }}>
        <h2 style={{ fontSize: "1.1rem" }}>Webhook registrations</h2>
        <ul>
          {REGISTERED_WEBHOOKS.map((topic) => (
            <li key={topic}>
              <code>{topic}</code>
            </li>
          ))}
        </ul>
        <h3 style={{ fontSize: "1rem" }}>GDPR / privacy compliance</h3>
        <ul>
          {GDPR_WEBHOOKS.map((topic) => (
            <li key={topic}>
              <code>{topic}</code>
            </li>
          ))}
        </ul>
        <p style={{ color: "#777", fontSize: "0.85rem" }}>
          Registrations are defined in <code>shopify.app.toml</code> and applied
          on app deploy.
        </p>
      </section>
    </main>
  );
}
