import { z } from "zod";

/**
 * Boot-time env validation. Required secrets (Shopify API secret, the shopper
 * JWT secret) are validated here so misconfiguration fails fast instead of
 * 500ing in production (PRD #37). Validation is skipped during CI/lint/test so
 * those tasks don't require real secrets.
 *
 * Hand-rolled with zod (rather than @t3-oss/env-nextjs) to avoid that lib's
 * excessively-deep type instantiation under zod 3.25.
 */
const schema = z.object({
  DATABASE_URL: z.string().min(1),

  // Shopify app credentials (Partner app / client_id is preserved across cutover).
  SHOPIFY_API_KEY: z.string().min(1),
  SHOPIFY_API_SECRET: z.string().min(1),

  // Shopper OTP sign-in: HS256 secret for the 1h checkout JWT.
  SHOPIFY_INTEGRATION_JWT_SECRET: z.string().min(1),

  // Outbound OTP email (Resend) — optional so the app boots without email in dev.
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),

  // Upstash Redis (OTP storage + rate limiting). Read by @ebox/redis-client.
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

const skipValidation =
  !!process.env.CI ||
  !!process.env.SKIP_ENV_VALIDATION ||
  process.env.NODE_ENV === "test" ||
  process.env.npm_lifecycle_event === "lint";

export const env = skipValidation
  ? (process.env as unknown as z.infer<typeof schema>)
  : schema.parse(process.env);
