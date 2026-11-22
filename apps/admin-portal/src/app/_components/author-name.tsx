"use client";

import { api } from "~/trpc/react";

/**
 * Shows the display name of an admin-portal user (e.g. a comment author).
 * Lookups are cached per user and batched into one request by tRPC.
 */
export default function AuthorName({ userId }: { userId?: string | null }) {
  const { data, isLoading } = api.user.getDisplayNames.useQuery(
    { ids: [userId ?? ""] },
    { enabled: Boolean(userId), staleTime: 5 * 60 * 1000 },
  );

  if (!userId) return <>Unknown user</>;
  if (isLoading) return <span className="text-muted-foreground">…</span>;
  return <>{data?.[userId] ?? "Unknown user"}</>;
}
