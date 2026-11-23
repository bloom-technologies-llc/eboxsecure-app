import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { CORS_HEADERS } from "~/lib/shopify/cors";

// The checkout UI extension fetches the /api/ebox/* endpoints cross-origin, so
// we must answer the browser's preflight (OPTIONS) and stamp CORS headers on
// every response — including errors, which the browser otherwise hides behind a
// generic CORS failure instead of surfacing the real 401/429 body.
export function middleware(request: NextRequest) {
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: { ...CORS_HEADERS } });
  }

  const response = NextResponse.next();
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

export const config = {
  matcher: "/api/ebox/:path*",
};
