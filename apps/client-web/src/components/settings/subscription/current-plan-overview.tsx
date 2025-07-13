import { getCurrentSubscriptionStatus } from "@/lib/get-subscription-data";
import { plans } from "@/utils/plans-data";
import { Zap } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ebox/ui/card";

export default async function CurrentPlanOverview() {
  const subscriptionStatus = await getCurrentSubscriptionStatus();

  const getCurrentPlan = () => {
    if (!subscriptionStatus || subscriptionStatus.status === "none") {
      return null;
    }
    return plans.find((plan) => plan.lookupKey === subscriptionStatus.plan);
  };

  const currentPlan = getCurrentPlan();

  if (!currentPlan || !subscriptionStatus) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Plan</CardTitle>
        <CardDescription>Your active subscription details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-lg font-semibold">{currentPlan.name} Plan</h3>
              <p className="text-sm text-muted-foreground">
                {subscriptionStatus.cancelAtPeriodEnd
                  ? `Cancels on ${new Date(subscriptionStatus.currentPeriodEnd! * 1000).toLocaleDateString()}`
                  : `Next billing date: ${new Date(subscriptionStatus.currentPeriodEnd! * 1000).toLocaleDateString()}`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{currentPlan.price}</p>
            <p className="text-sm text-muted-foreground">/month</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
