import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";

import { createCaller, createTRPCContext } from "@ebox/client-api";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(headers());
  heads.set("x-trpc-source", "rsc");
  heads.set("application-source", "eboxsecure-client-web");

  return createTRPCContext({
    session: await auth(),
    headers: heads,
  });
});

export const api = createCaller(createContext);
