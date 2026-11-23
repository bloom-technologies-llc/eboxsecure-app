/**
 * Returns the customer-facing web app base URL (no trailing slash) for the
 * current deployment environment.
 *
 * IMPORTANT: Do NOT build links for emails/SMS from `process.env.VERCEL_URL`.
 * On Vercel that variable is the auto-generated per-deployment `*.vercel.app`
 * host, not our custom domain, so any link built from it leaks a vercel.app
 * URL to the recipient. This helper maps the Vercel environment to the stable
 * custom domain instead.
 *
 * Mirrors `getClientAppUrl()` in `apps/marketing-site/src/env.ts`.
 */
export function getClientAppUrl(): string {
  // `VERCEL_ENV` is the always-present Vercel system variable
  // (production | preview | development). Fall back to the public variant
  // that is set in local `.env`.
  const vercelEnv = process.env.VERCEL_ENV ?? process.env.NEXT_PUBLIC_VERCEL_ENV;

  if (vercelEnv === "production") {
    return "https://app.eboxsecure.com";
  }

  if (vercelEnv === "preview") {
    return "https://app-qa.eboxsecure.com";
  }

  // development / local / unknown
  return "http://localhost:3000";
}
