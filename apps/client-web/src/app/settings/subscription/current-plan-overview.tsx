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
  } = await api.subscription.getCurrentPlan();

  if (!currentPlan || !subscriptionData) {
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
              <h3 className="text-lg font-semibold">{currentPlan} Plan</h3>

              <p className="text-sm text-muted-foreground">
                {subscriptionData.cancelAtPeriodEnd
                  ? `Cancels on ${new Date(subscriptionData.currentPeriodEnd! * 1000).toLocaleDateString()}`
                  : `Next billing date: ${new Date(subscriptionData.currentPeriodEnd! * 1000).toLocaleDateString()}`}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold">{price}</p>

            <p className="text-sm text-muted-foreground">/month</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
