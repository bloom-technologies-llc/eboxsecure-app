# EboxSecure Monorepo

This contains all Next.js applications. Due to issues regarding this monorepo and clerk-expo, all mobile applications are a separate repository. The mobile applications make API calls directly to our equivalent Next.js backend APIs.
### Logging

We use Axiom for logging. In order to log to Axiom's log streams, use the `log` object for server-side Next.js logging or the `useLogger` hook for client-side logging, sourced by whatever application you're in. To log within a tRPC server, use the `ctx.log` object.
