import SettingsLayout from "@/components/settings-layout";
import { Crown } from "lucide-react";

import { Card, CardDescription, CardHeader, CardTitle } from "@ebox/ui/card";

import BillingSection from "./billing-section";
import CancellationBanner from "./cancellation-banner";
import CurrentPlanOverview from "./current-plan-overview";
import PricingPlans from "./pricing-plans";

export default function SubscriptionPage() {
  return (
    <SettingsLayout>
      <div className="space-y-6">
        <CancellationBanner />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Subscription Plans
            </CardTitle>
            <CardDescription>
              Choose the plan that best fits your package delivery needs
            </CardDescription>
          </CardHeader>
        </Card>
        <CurrentPlanOverview />
        <PricingPlans />
        <BillingSection />
      </div>
    </SettingsLayout>
  );
}
