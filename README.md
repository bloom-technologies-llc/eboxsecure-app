# EboxSecure Monorepo

### Logging

We use Axiom for logging. In order to log to Axiom's log streams, use the `log` object for server-side Next.js logging or the `useLogger` hook for client-side logging, sourced by whatever application you're in. To log within a tRPC server, use the `ctx.log` object.
