import Script from "next/script";

import { db } from "@ebox/db";

import { env } from "~/env";
import { isValidShopDomain } from "~/lib/shopify/oauth";
import { loadSessionByShop } from "~/lib/shopify/session";

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
 * has completed OAuth (a stored offline token + granted scopes) and lists the
 * webhook/GDPR registrations. Resilient by design: no shop, an invalid shop, or
 * a missing session all render a clear state instead of throwing.
 *
 * App Bridge is loaded from Shopify's CDN (no npm dependency) only when both a
 * public API key and a `host` param are present — outside the embedded iframe it
 * simply renders as a plain page.
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
  const apiKey = env.NEXT_PUBLIC_SHOPIFY_API_KEY;

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
      {apiKey && host ? (
        <Script
          src="https://cdn.shopify.com/shopifycloud/app-bridge.js"
          data-api-key={apiKey}
          strategy="beforeInteractive"
        />
      ) : null}

      <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>
        EboxSecure
      </h1>
      <p style={{ color: "#555", marginTop: 0 }}>
        Locker fulfillment for your Shopify store.
      </p>

      <section style={{ marginTop: "1.5rem" }}>
        <h2 style={{ fontSize: "1.1rem" }}>Connection</h2>
        {!shop ? (
          <p>
            No store specified. Open this page from your Shopify admin, or begin
            installation at <code>/auth?shop=your-store.myshopify.com</code>.
          </p>
        ) : connected ? (
          <p>
            <strong style={{ color: "#0a7d28" }}>Connected</strong> — {shop} has
            authorized EboxSecure.
            <br />
            Granted scopes: <code>{session?.scope ?? "(none recorded)"}</code>
          </p>
        ) : (
          <p>
            <strong style={{ color: "#b25000" }}>Not connected</strong> — {shop}{" "}
            has not completed installation.{" "}
            <a href={`/auth?shop=${encodeURIComponent(shop)}`}>
              Install EboxSecure
            </a>
            .
          </p>
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
