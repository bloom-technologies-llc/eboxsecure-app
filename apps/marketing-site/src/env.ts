import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here.
   * This way you can ensure the app isn't built with invalid env vars.
   */
  server: {},
  /**
   * Specify your client-side environment variables schema here.
   * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_MAPS_EMBED_API_KEY: z.string(),
    NEXT_PUBLIC_VERCEL_ENV: z.enum(["development", "preview", "production"]),
  },
  /**
   * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
   */
  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_MAPS_EMBED_API_KEY: process.env.NEXT_PUBLIC_MAPS_EMBED_API_KEY,
    NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
  },
  skipValidation:
    !!process.env.CI ||
    !!process.env.SKIP_ENV_VALIDATION ||
    process.env.npm_lifecycle_event === "lint",
  shared: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
});

// Utility function to get the client app URL based on NODE_ENV and hostname
export function getClientAppUrl(): string {
  // Development environment
  if (env.NEXT_PUBLIC_VERCEL_ENV === "development") {
    return "http://localhost:3000";
  }

  // Production/other environments - check hostname for QA vs Prod
  if (env.NEXT_PUBLIC_VERCEL_ENV === "preview") {
    return "https://app-qa.eboxsecure.com";
  }

  // Default to production
  return "https://app.eboxsecure.com";
}
