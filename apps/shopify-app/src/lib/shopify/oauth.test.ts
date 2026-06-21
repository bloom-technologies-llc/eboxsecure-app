import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";

import {
  buildAuthorizeUrl,
  exchangeCodeForToken,
  isValidShopDomain,
  verifyOAuthCallbackHmac,
} from "./oauth";

const SECRET = "test-shopify-secret";

/**
 * Compute the expected `hmac` exactly as Shopify does: drop hmac/signature,
 * sort by key, join as `k=v&...`, HMAC-SHA256 hex. Used to build known-good
 * vectors and to derive a deliberately-wrong one.
 */
const signQuery = (params: Record<string, string>, secret = SECRET) => {
  const message = Object.entries(params)
    .filter(([k]) => k !== "hmac" && k !== "signature")
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  return createHmac("sha256", secret).update(message, "utf8").digest("hex");
};

describe("isValidShopDomain", () => {
  it("accepts well-formed myshopify hosts", () => {
    expect(isValidShopDomain("acme.myshopify.com")).toBe(true);
    expect(isValidShopDomain("bloom-dev-store1.myshopify.com")).toBe(true);
  });

  it("rejects malformed / spoofed hosts and empty input", () => {
    expect(isValidShopDomain("acme.myshopify.com.evil.com")).toBe(false);
    expect(isValidShopDomain("acme.example.com")).toBe(false);
    expect(isValidShopDomain("https://acme.myshopify.com")).toBe(false);
    expect(isValidShopDomain("-bad.myshopify.com")).toBe(false);
    expect(isValidShopDomain("")).toBe(false);
    expect(isValidShopDomain(null)).toBe(false);
    expect(isValidShopDomain(undefined)).toBe(false);
  });
});

describe("buildAuthorizeUrl", () => {
  it("builds an authorize URL with the expected params", () => {
    const url = new URL(
      buildAuthorizeUrl({
        shop: "acme.myshopify.com",
        apiKey: "key-123",
        scopes: "read_orders,read_customers",
        redirectUri: "https://app.example.com/api/auth/callback",
        state: "nonce-abc",
      }),
    );

    expect(url.origin).toBe("https://acme.myshopify.com");
    expect(url.pathname).toBe("/admin/oauth/authorize");
    expect(url.searchParams.get("client_id")).toBe("key-123");
    expect(url.searchParams.get("scope")).toBe("read_orders,read_customers");
    expect(url.searchParams.get("redirect_uri")).toBe(
      "https://app.example.com/api/auth/callback",
    );
    expect(url.searchParams.get("state")).toBe("nonce-abc");
  });

  it("omits grant_options so Shopify issues an offline token", () => {
    const url = new URL(
      buildAuthorizeUrl({
        shop: "acme.myshopify.com",
        apiKey: "k",
        scopes: "read_orders",
        redirectUri: "https://app.example.com/api/auth/callback",
        state: "s",
      }),
    );
    expect(url.searchParams.has("grant_options[]")).toBe(false);
  });
});

describe("verifyOAuthCallbackHmac", () => {
  const base: Record<string, string> = {
    code: "auth-code",
    shop: "acme.myshopify.com",
    state: "nonce-abc",
    timestamp: "1700000000",
  };

  it("accepts a correct hmac (URLSearchParams input)", () => {
    const params = new URLSearchParams({ ...base, hmac: signQuery(base) });
    expect(verifyOAuthCallbackHmac(params, SECRET)).toBe(true);
  });

  it("accepts a correct hmac (plain object input)", () => {
    expect(
      verifyOAuthCallbackHmac({ ...base, hmac: signQuery(base) }, SECRET),
    ).toBe(true);
  });

  it("rejects a tampered param", () => {
    const goodHmac = signQuery(base);
    const tampered = new URLSearchParams({
      ...base,
      shop: "evil.myshopify.com",
      hmac: goodHmac,
    });
    expect(verifyOAuthCallbackHmac(tampered, SECRET)).toBe(false);
  });

  it("rejects an hmac signed with the wrong secret", () => {
    const params = new URLSearchParams({
      ...base,
      hmac: signQuery(base, "wrong-secret"),
    });
    expect(verifyOAuthCallbackHmac(params, SECRET)).toBe(false);
  });

  it("rejects a missing hmac and an empty secret", () => {
    expect(verifyOAuthCallbackHmac(new URLSearchParams(base), SECRET)).toBe(
      false,
    );
    expect(
      verifyOAuthCallbackHmac({ ...base, hmac: signQuery(base) }, ""),
    ).toBe(false);
  });
});

describe("exchangeCodeForToken", () => {
  it("POSTs the code and returns the token + scope on success", async () => {
    let captured: { url: string; init: RequestInit } | null = null;
    const fetchImpl = (async (
      url: string | URL | Request,
      init?: RequestInit,
    ) => {
      captured = { url: String(url), init: init ?? {} };
      return new Response(
        JSON.stringify({ access_token: "shpat_xyz", scope: "read_orders" }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }) as typeof globalThis.fetch;

    const result = await exchangeCodeForToken(
      {
        shop: "acme.myshopify.com",
        apiKey: "key-123",
        apiSecret: "secret-456",
        code: "auth-code",
      },
      { fetchImpl },
    );

    expect(result).toEqual({ accessToken: "shpat_xyz", scope: "read_orders" });
    expect(captured!.url).toBe(
      "https://acme.myshopify.com/admin/oauth/access_token",
    );
    expect(captured!.init.method).toBe("POST");
    const sentBody = JSON.parse(captured!.init.body as string);
    expect(sentBody).toEqual({
      client_id: "key-123",
      client_secret: "secret-456",
      code: "auth-code",
    });
  });

  it("throws on a non-200 response", async () => {
    const fetchImpl = (async () =>
      new Response("nope", { status: 401 })) as typeof globalThis.fetch;

    await expect(
      exchangeCodeForToken(
        { shop: "acme.myshopify.com", apiKey: "k", apiSecret: "s", code: "c" },
        { fetchImpl },
      ),
    ).rejects.toThrow(/token exchange failed/i);
  });

  it("throws on a malformed body", async () => {
    const fetchImpl = (async () =>
      new Response(JSON.stringify({ access_token: 123 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })) as typeof globalThis.fetch;

    await expect(
      exchangeCodeForToken(
        { shop: "acme.myshopify.com", apiKey: "k", apiSecret: "s", code: "c" },
        { fetchImpl },
      ),
    ).rejects.toThrow(/malformed body/i);
  });
});
