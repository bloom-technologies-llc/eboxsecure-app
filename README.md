# EboxSecure Monorepo

This contains all Next.js applications. Due to issues regarding this monorepo and clerk-expo, all mobile applications are a separate repository. The mobile applications make API calls directly to our equivalent Next.js backend APIs.

### API in Next.js applications

In each Next.js application, there is a `trpc` folder that contains two files: `react.tsx` and `server.ts`. The `react.tsx` file creates the query client which sets the headers and creates an `api` object that routes all calls to the `/api/trpc` endpoint. The `server.ts` file creates an `api` object that directly calls the TRPC resolvers.

### When to use which `api` object?

Rule of thumb:

1. If you are in a React Server Component, use the `api` object from `trpc/server.ts`
2. If you are in a React Client Component, use the `api` object from `trpc/react.ts`

Example usage of RSC `api` object:

```
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";

import PortraitPhotoUpload from "./PortraitPhotoUpload";

export default async function Page() {
  const isOnboarded = await api.onboarding.isOnboarded();
  if (isOnboarded) {
    redirect("/");
  }
  return (
    <div className="flex h-screen w-full flex-col items-center gap-8 pt-24">
      <PortraitPhotoUpload />
    </div>
  );
}
```

Note that the `api` object for RSCs are asynchronous, and require you to await.

Example usage of client-side `api` object:

```
"use client";

import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";

export default function Page() {
  const router = useRouter();

  const { data } = api.onboarding.checkUploadStatus.useQuery(undefined, {
    refetchInterval: 2500,
  });

  if (data) {
    router.push("/");
  }

  return (
    <div>
      <h1>
        Once you have successfully uploaded your photo on your phone, this page
        will redirect you to the next step.
      </h1>
    </div>
  );
}
```

Note the `'use client'` directive at the top of the file. This is required for React Client Components. Because of that directive, we use `useQuery` and `useMutation` hooks to fetch and mutate data.

### Logging

We use Axiom for logging. In order to log to Axiom's log streams, use the `log` object for server-side Next.js logging or the `useLogger` hook for client-side logging, sourced by whatever application you're in. To log within a tRPC server, use the `ctx.log` object.

### Stripe

The lookup key for the meter `package_allowance` is `<tier>_allowance`. More explicitly:

1. basic_allowance
2. basic_plus_allowance
3. premium_allowance
4. business_pro_allowance

The lookup key for the meter `overdue_package_holding` is `<tier>_overdue_holding`. More explicitly:

1. basic_overdue_holding
2. basic_plus_overdue_holding
3. premium_overdue_holding
4. business_pro_overdue_holding

If the tier is yearly, all tiers are appended with `_yearly`. Therefore, the entire repository of prices is:

Basic:

- month:
  - basic
  - basic_allowance
  - basic_overdue_holding
- year:
  - basic_yearly
  - basic_yearly_allowance
  - basic_yearly_overdue_holding

Basic+:

- month:
  - basic_plus
  - basic_plus_allowance
  - basic_plus_overdue_holding
- year:
  - basic_plus_yearly
  - basic_plus_yearly_allowance
  - basic_plus_yearly_overdue_holding

Premium:

- month:
  - premium
  - premium_allowance
  - premium_overdue_holding
- year:
  - premium_yearly
  - premium_yearly_allowance
  - premium_yearly_overdue_holding

Business Pro:

- month:
  - business_pro
  - business_pro_allowance
  - business_pro_overdue_holding
- year:
  - business_pro_yearly
  - business_pro_yearly_allowance
  - business_pro_yearly_overdue_holding

In general, the way we do this is quite confusing, because our SubscriptionTypes are one of the four subscription plans, and then we append `_yearly` if it's a yearly subscription. Perhaps in the future we refactor everything within the `subscription.ts` client api routes.
