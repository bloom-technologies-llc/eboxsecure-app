import type { NextRequest } from "next/server";
import { env } from "@/env";
import { verifyToken } from "@clerk/backend";
import { auth } from "@clerk/nextjs/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter, createTRPCContext } from "@ebox/client-api";

/**
 * Configure basic CORS headers
 * You should extend this to match your needs
 */
const setCorsHeaders = (res: Response) => {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Request-Method", "*");
  res.headers.set("Access-Control-Allow-Methods", "OPTIONS, GET, POST");
  res.headers.set("Access-Control-Allow-Headers", "*");
};

export const OPTIONS = () => {
  const response = new Response(null, {
    status: 204,
  });
  setCorsHeaders(response);
  return response;
};

const handler = async (req: NextRequest) => {
  // Check for authorization header (from mobile)
  const authHeader = req.headers.get("authorization");
  let session;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    console.log("Handling mobile request");
    // Handle token-based authentication (mobile)
    const token = authHeader.substring(7);
    try {
      const verifiedToken = await verifyToken(token, {
        secretKey: env.CLERK_SECRET_KEY,
      });
      // Create a minimal session object with verified user
      session = {
        userId: verifiedToken.sub,
        sessionId: verifiedToken.sid,
      } as any; // Type assertion to bypass complex AuthObject typing
      console.log("mobile session: ", session);
    } catch (error) {
      console.error("Token verification failed:", error);
      // Return signed out session
      session = {
        userId: null,
        sessionId: null,
      } as any; // Type assertion to bypass complex AuthObject typing
      console.error("Mobile session verification failed");
    }
  } else {
    // Handle browser-based authentication (web)
    session = await auth();
  }

  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    router: appRouter,
    req,
    createContext: async () =>
      createTRPCContext({
        session,
        headers: req.headers,
      }),
    onError({ error, path }) {
      console.error(`>>> tRPC Error on '${path}'`, error);
    },
  });
  setCorsHeaders(response);
  return response;
};

export { handler as GET, handler as POST };
