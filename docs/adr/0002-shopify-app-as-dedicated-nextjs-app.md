# Host the Shopify app as a dedicated Next.js app on Vercel

The Shopify app's HTTP surface — OAuth install, webhooks, the embedded admin page, and
the checkout-extension endpoints — will live in a new `apps/shopify` Next.js app deployed
on Vercel, rather than as an Express service or folded into `apps/admin-portal`. OAuth is
reimplemented with Shopify managed install + token exchange on `@shopify/shopify-api`
(dropping the `@shopify/shopify-app-express` adapter); session storage reuses the
framework-agnostic Prisma adapter against the existing `shopify_session` table.

**Why:** One deployment platform (Vercel), and Next transpiles `@ebox/db` — which
eliminates the Express container's `workspace:*` install failure and its raw-`.ts` import
problem. It isolates public-embedded-app concerns (frame-ancestors CSP, public CORS, App
Bridge) from the Clerk-gated admin tool, and gives a stable `application_url` on its own
domain.

**Considered and rejected:** (B) a thin Express container — reuses the approved OAuth
code but adds a second runtime and still must solve `@ebox/db` packaging; (C) folding into
`apps/admin-portal` — conflates a public, frame-embedded app with the internal
Clerk-gated tool (CSP / CORS / auth conflicts).

**Consequences:** Hand-rolling token-exchange OAuth + session-token auth is the main
net-new work and the migration's highest-risk piece. The clean slate (zero installs) is
what makes it safe to do now.
