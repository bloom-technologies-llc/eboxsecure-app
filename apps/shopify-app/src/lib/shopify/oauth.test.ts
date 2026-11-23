import { SignJWT } from "jose";
import { describe, expect, it } from "vitest";

import {
  exchangeSessionTokenForToken,
  isValidShopDomain,
  verifySessionToken,
} from "./oauth";

const API_KEY = "api-key-123";
const SECRET = "test-shopify-secret";

/** Mint a session-token-shaped JWT (HS256) for the verify tests. */
async function signSessionToken(
  claims: Record<string, unknown>,
  { secret = SECRET, expInSeconds = 60 }: { secret?: string; expInSeconds?: number } = {},
): Promise<string> {
  const key = new TextEncoder().encode(secret);
  return new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(`${expInSeconds}s`)
    .sign(key);
}

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

describe("verifySessionToken", () => {
  it("verifies a well-formed token and extracts the shop from dest", async () => {
    const token = await signSessionToken({
      aud: API_KEY,
      dest: "https://acme.myshopify.com",
      iss: "https://acme.myshopify.com/admin",
    });

    const { shop } = await verifySessionToken(token, {
      apiKey: API_KEY,
      apiSecret: SECRET,
    });

    expect(shop).toBe("acme.myshopify.com");
  });

  it("rejects a token signed with the wrong secret", async () => {
    const token = await signSessionToken(
      { aud: API_KEY, dest: "https://acme.myshopify.com" },
      { secret: "wrong-secret" },
    );

    await expect(
      verifySessionToken(token, { apiKey: API_KEY, apiSecret: SECRET }),
    ).rejects.toThrow();
  });

  it("rejects a token minted for a different app (wrong aud)", async () => {
    const token = await signSessionToken({
      aud: "some-other-app",
      dest: "https://acme.myshopify.com",
    });

    await expect(
      verifySessionToken(token, { apiKey: API_KEY, apiSecret: SECRET }),
    ).rejects.toThrow();
  });

  it("rejects a token whose dest is not a myshopify domain", async () => {
    const token = await signSessionToken({
      aud: API_KEY,
      dest: "https://evil.example.com",
    });

    await expect(
      verifySessionToken(token, { apiKey: API_KEY, apiSecret: SECRET }),
    ).rejects.toThrow(/dest/i);
  });

  it("rejects an expired token", async () => {
    const token = await signSessionToken(
      { aud: API_KEY, dest: "https://acme.myshopify.com" },
      { expInSeconds: -10 },
    );

    await expect(
      verifySessionToken(token, { apiKey: API_KEY, apiSecret: SECRET }),
    ).rejects.toThrow();
  });
});

describe("exchangeSessionTokenForToken", () => {
  it("POSTs the token-exchange grant and returns the token + scope", async () => {
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

    const result = await exchangeSessionTokenForToken(
      {
        shop: "acme.myshopify.com",
        apiKey: "key-123",
        apiSecret: "secret-456",
        sessionToken: "session.jwt.token",
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
      grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
      subject_token: "session.jwt.token",
      subject_token_type: "urn:ietf:params:oauth:token-type:id_token",
      requested_token_type:
        "urn:shopify:params:oauth:token-type:offline-access-token",
    });
  });

  it("throws on a non-200 response", async () => {
    const fetchImpl = (async () =>
      new Response("nope", { status: 401 })) as typeof globalThis.fetch;

    await expect(
      exchangeSessionTokenForToken(
        {
          shop: "acme.myshopify.com",
          apiKey: "k",
          apiSecret: "s",
          sessionToken: "t",
        },
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
      exchangeSessionTokenForToken(
        {
          shop: "acme.myshopify.com",
          apiKey: "k",
          apiSecret: "s",
          sessionToken: "t",
        },
        { fetchImpl },
      ),
    ).rejects.toThrow(/malformed body/i);
  });
});
