import { getCurrentSubscriptionStatus } from "@/lib/get-subscription-data";
import { plans } from "@/utils/plans-data";

import { Button } from "@ebox/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ebox/ui/card";

import { CancelSubscriptionDialog } from "./cancel-subscription-dialog";
import { ReactivateButton } from "./reactivate-button";

export default async function BillingSection() {
  const subscriptionStatus = await getCurrentSubscriptionStatus();

  const getCurrentPlan = () => {
    if (!subscriptionStatus || subscriptionStatus.status === "none") {
      return null;
    }
    return plans.find((plan) => plan.lookupKey === subscriptionStatus.plan);
  };

  const currentPlan = getCurrentPlan();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing Information</CardTitle>
        <CardDescription>
          Manage your subscription billing details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Auto-renewal</p>
            <p className="text-sm text-muted-foreground">
              {subscriptionStatus?.cancelAtPeriodEnd
                ? `Subscription will end on ${new Date(subscriptionStatus.currentPeriodEnd! * 1000).toLocaleDateString()}`
                : subscriptionStatus?.currentPeriodEnd
                  ? `Your subscription will automatically renew on ${new Date(subscriptionStatus.currentPeriodEnd * 1000).toLocaleDateString()}`
                  : "Manage your subscription billing details"}
            </p>
          </div>
          {subscriptionStatus?.cancelAtPeriodEnd ? (
            <ReactivateButton />
          ) : (
            <Button variant="outline">Manage Billing</Button>
          )}
        </div>

        {subscriptionStatus?.status === "active" &&
          currentPlan &&
          !subscriptionStatus?.cancelAtPeriodEnd && (
            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <p className="text-sm font-medium">Cancel Subscription</p>
                <p className="text-sm text-muted-foreground">
                  You can cancel anytime. Your plan will remain active until the
                  next billing cycle.
                </p>
              </div>
              <CancelSubscriptionDialog
                currentPlanName={currentPlan.name}
                currentPeriodEnd={subscriptionStatus.currentPeriodEnd!}
              />
            </div>
          )}
      </CardContent>
    </Card>
  );
}
