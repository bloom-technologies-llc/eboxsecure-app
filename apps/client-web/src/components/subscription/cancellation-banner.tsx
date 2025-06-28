import { getCurrentSubscriptionStatus } from "@/lib/get-subscription-data";
import { AlertTriangle } from "lucide-react";

import { Card, CardContent } from "@ebox/ui/card";

export default async function CancellationBanner() {
  const subscriptionStatus = await getCurrentSubscriptionStatus();

  // Only show banner if subscription is cancelled but still active
  if (
    !subscriptionStatus?.cancelAtPeriodEnd ||
    !subscriptionStatus?.currentPeriodEnd
  ) {
    return null;
  }

  const cancellationDate = new Date(
    subscriptionStatus.currentPeriodEnd * 1000,
  ).toLocaleDateString();

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600" />
          <div className="text-orange-800">
            <p className="font-medium">Your Subscription Will Not Renew</p>
            <p className="mt-1 text-sm">
              Your subscription has been cancelled and will end on{" "}
              <strong>{cancellationDate}</strong>. You can reactivate your
              subscription anytime before this date to continue your service.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
