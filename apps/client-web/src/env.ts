import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here.
   * This way you can ensure the app isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string(),
    CLERK_SECRET_KEY: z.string(),
    VERCEL_URL: z.string(),
    JWT_SECRET_KEY: z.string(),
    CLERK_CREATE_USER_WEBHOOK_SECRET: z.string(),
    CLERK_MANAGE_SESSION_WEBHOOK_SECRET: z.string(),
    UPLOADTHING_TOKEN: z.string(),
    RESEND_API_KEY: z.string(),
    RESEND_FROM_EMAIL: z
      .string()
      .default("notifications@mailer.bloomtechnologies.co"),
    UPSTASH_REDIS_REST_URL: z.string(),
    UPSTASH_REDIS_REST_TOKEN: z.string(),
    STRIPE_SECRET_KEY: z.string(),
    STRIPE_WEBOOK_SECRET: z.string(),
  },
  /**
   * Specify your client-side environment variables schema here.
   * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
    NEXT_PUBLIC_MAPS_EMBED_API_KEY: z.string(),
  },
  /**
   * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
   */
  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_MAPS_EMBED_API_KEY: process.env.NEXT_PUBLIC_MAPS_EMBED_API_KEY,
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
