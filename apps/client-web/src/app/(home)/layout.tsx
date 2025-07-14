import { redirect } from "next/navigation";
import { api } from "@/trpc/server";

import { hasValidSubscription } from "@ebox/client-api";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check subscription status first
  const userHasValidSubscription = await hasValidSubscription();

  if (!userHasValidSubscription) {
    redirect("/payment");
  }

  // Then check onboarding status
  const isOnboarded = await api.onboarding.isOnboarded();

  if (!isOnboarded) {
    redirect("/onboarding");
  }

  return <>{children}</>;
}
