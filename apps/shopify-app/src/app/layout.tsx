import type { ReactNode } from "react";

import { env } from "~/env";

export const metadata = {
  title: "EboxSecure",
  description: "EboxSecure Shopify app",
};

/**
 * Root layout. Loads Shopify App Bridge from the CDN so the embedded status
 * page can use `window.shopify` (session token / token exchange). App Bridge
 * reads the app's client_id from the `shopify-api-key` meta tag, which must be
 * present in `<head>` before the script executes — hence the explicit head.
 * Rendered only when the public API key is configured; outside the embedded
 * iframe App Bridge is inert.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  const apiKey = env.NEXT_PUBLIC_SHOPIFY_API_KEY;
  return (
    <html lang="en">
      <head>
        {apiKey ? (
          <>
            <meta name="shopify-api-key" content={apiKey} />
            {/* eslint-disable-next-line @next/next/no-sync-scripts */}
            <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js" />
          </>
        ) : null}
      </head>
      <body>{children}</body>
    </html>
  );
}
