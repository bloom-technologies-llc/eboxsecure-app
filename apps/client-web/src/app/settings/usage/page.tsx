import SettingsLayout from "@/components/settings/settings-layout";
import { UsageCard } from "@/components/settings/usage/usage-card";
import { UsageHistoryTable } from "@/components/settings/usage/usage-history-table";
import { BarChart3, Calendar, Clock, Package, TrendingUp } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ebox/ui/card";

export default function UsagePage() {
  return (
    <SettingsLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Usage & Metering
            </CardTitle>
            <CardDescription>
              Monitor your package usage and track your plan limits
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Current Usage Card */}
        <UsageCard />

        {/* Usage Audit Trail */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Usage Audit Trail
            </CardTitle>
            <CardDescription>
              Detailed history of all your package usage events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UsageHistoryTable />
          </CardContent>
        </Card>

        {/* Usage Tips & Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Usage Tips
            </CardTitle>
            <CardDescription>
              Learn how to optimize your package usage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3 rounded-lg border p-4">
                <Package className="mt-1 h-5 w-5 text-purple-600" />
                <div>
                  <h4 className="font-medium">Package Allowance</h4>
                  <p className="text-sm text-muted-foreground">
                    Track how many packages you can receive per month based on
                    your plan
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border p-4">
                <Clock className="mt-1 h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-medium">Holding Period</h4>
                  <p className="text-sm text-muted-foreground">
                    Monitor how long packages are held at our secure locations
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-blue-50 p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Monthly Reset
                </span>
              </div>
              <p className="mt-1 text-sm text-blue-700">
                Your usage counters reset at the beginning of each billing
                cycle. Consider upgrading your plan if you consistently exceed
                your limits.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
}
