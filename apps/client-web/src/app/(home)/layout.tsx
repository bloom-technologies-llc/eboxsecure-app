import { redirect } from "next/navigation";
import { checkValidSubscription } from "@/lib/subscription-utils";
import { api } from "@/trpc/server";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check subscription status first
  const hasValidSubscription = await checkValidSubscription();

  if (!hasValidSubscription) {
    redirect("/payment");
  }

  // Then check onboarding status
  const isOnboarded = await api.onboarding.isOnboarded();

  if (!isOnboarded) {
    redirect("/onboarding");
  }

  return <>{children}</>;
}
