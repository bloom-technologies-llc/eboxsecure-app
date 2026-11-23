// CORS for the checkout UI extension's cross-origin calls.
//
// The extension runs in a sandboxed, Shopify-controlled context whose request
// Origin varies by shop and is effectively opaque, so we can't reflect a stable
// allowlisted origin. These endpoints carry no cookies — auth is an OTP plus a
// bearer JWT in the header/body, never credentials — so a wildcard origin is
// safe: there is nothing ambient a hostile page could ride on. `Authorization`
// is allowed for the /locations bearer token; `Content-Type` for the JSON POSTs.
export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
} as const;
