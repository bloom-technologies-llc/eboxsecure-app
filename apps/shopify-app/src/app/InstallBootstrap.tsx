"use client";

import { useEffect, useState } from "react";

/**
 * Completes managed installation from inside the embedded admin iframe.
 *
 * Under managed installation Shopify grants scopes but never calls a redirect
 * callback, so on first load the app has no access token. This component grabs
 * the App Bridge session token (`shopify.idToken()`), posts it to
 * `/api/auth/token` for a one-time token exchange, then reloads so the server
 * re-renders as "Connected". App Bridge itself is loaded in `layout.tsx`.
 *
 * Runs only when embedded (a `host` param is present) and not already connected.
 * A small attempt counter in `sessionStorage` prevents a reload loop if the
 * exchange keeps failing.
 */

const ATTEMPT_KEY = "ebox_install_attempts";
const MAX_ATTEMPTS = 2;

type ShopifyGlobal = { idToken?: () => Promise<string> };

export function InstallBootstrap({
  connected,
  embedded,
}: {
  connected: boolean;
  embedded: boolean;
}) {
  const [state, setState] = useState<"connecting" | "error">("connecting");

  useEffect(() => {
    if (connected) {
      sessionStorage.removeItem(ATTEMPT_KEY);
      return;
    }
    if (!embedded) return;

    const attempts = Number(sessionStorage.getItem(ATTEMPT_KEY) ?? "0");
    if (attempts >= MAX_ATTEMPTS) {
      setState("error");
      return;
    }

    let cancelled = false;
    void (async () => {
      const shopify = await waitForShopify();
      if (!shopify?.idToken) {
        if (!cancelled) setState("error");
        return;
      }
      try {
        const idToken = await shopify.idToken();
        const res = await fetch("/api/auth/token", {
          method: "POST",
          headers: { authorization: `Bearer ${idToken}` },
        });
        if (cancelled) return;
        if (res.ok) {
          sessionStorage.setItem(ATTEMPT_KEY, String(attempts + 1));
          window.location.reload();
        } else {
          setState("error");
        }
      } catch {
        if (!cancelled) setState("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [connected, embedded]);

  if (connected) return null;

  if (!embedded) {
    return (
      <p style={{ color: "#555" }}>
        Open this app from your Shopify admin to finish installation.
      </p>
    );
  }

  if (state === "error") {
    return (
      <p style={{ color: "#b25000" }}>
        Couldn&apos;t finish installation automatically. Try reopening the app
        from your Shopify admin.
      </p>
    );
  }

  return <p style={{ color: "#555" }}>Finishing installation…</p>;
}

/** Poll briefly for App Bridge to attach `window.shopify` before giving up. */
async function waitForShopify(): Promise<ShopifyGlobal | undefined> {
  const w = window as unknown as { shopify?: ShopifyGlobal };
  for (let i = 0; i < 50 && !w.shopify?.idToken; i++) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return w.shopify;
}
