import { api } from "@/trpc/server";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ebox/ui/card";

export default async function CurrentPlanOverview() {
  const {
    plan: currentPlan,
    subscriptionData,
    price,
    scheduledPlan,
  } = await api.subscription.getCurrentPlan();

  if (!currentPlan || !subscriptionData) {
    return null;
  }

  const hasScheduledChange = !!scheduledPlan;
  const scheduledChangeDate = scheduledPlan
    ? new Date(scheduledPlan.startDate * 1000)
    : null;

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
              <h3 className="text-lg font-semibold">
                {currentPlan.subscriptionType} Plan
              </h3>

              {hasScheduledChange ? (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Current billing continues until{" "}
                    {new Date(
                      subscriptionData.currentPeriodEnd! * 1000,
                    ).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {scheduledPlan.changeType === "downgrade"
                      ? `Downgrades to ${scheduledPlan.plan.subscriptionType} ${scheduledPlan.plan.isYearly ? "yearly" : "monthly"} on ${scheduledChangeDate?.toLocaleDateString()}`
                      : `Changes to ${scheduledPlan.plan.subscriptionType} ${scheduledPlan.plan.isYearly ? "yearly" : "monthly"} on ${scheduledChangeDate?.toLocaleDateString()}`}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {subscriptionData.cancelAtPeriodEnd
                    ? `Cancels on ${new Date(subscriptionData.currentPeriodEnd! * 1000).toLocaleDateString()}`
                    : `Next billing date: ${new Date(subscriptionData.currentPeriodEnd! * 1000).toLocaleDateString()}`}
                </p>
              )}
            </div>
          </div>

          <div className="text-right">
            <div>
              <p className="text-2xl font-bold">${price?.toString() || ""}</p>
              <p className="text-sm text-muted-foreground">
                /{currentPlan.isYearly ? "year" : "month"}
              </p>
            </div>

            {hasScheduledChange && (
              <div className="mt-2 border-t border-gray-200 pt-2">
                <p className="text-sm text-muted-foreground">
                  Next billing cycle:
                </p>
                <p className="text-lg font-semibold">${scheduledPlan.price}</p>
                <p className="text-xs text-muted-foreground">
                  /{scheduledPlan.plan.isYearly ? "year" : "month"}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
