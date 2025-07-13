"use client";

import { api } from "@/trpc/react";
import { AlertTriangle, CheckCircle, Clock, Package } from "lucide-react";

import { Badge } from "@ebox/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@ebox/ui/card";
import { Progress } from "@ebox/ui/progress";

export function UsageCard() {
  const {
    data: usage,
    isLoading,
    error,
  } = api.meter.getCurrentUsage.useQuery();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Metered Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 animate-pulse rounded bg-gray-200" />
            <div className="h-4 animate-pulse rounded bg-gray-200" />
            <div className="h-4 animate-pulse rounded bg-gray-200" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Metered Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-4 w-4" />
            <span>Failed to load usage data</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!usage) {
    return null;
  }

  const formatSubscriptionTier = (tier: string) => {
    switch (tier) {
      case "BASIC":
        return "Basic";
      case "BASIC_PLUS":
        return "Basic+";
      case "PREMIUM":
        return "Premium";
      case "BUSINESS_PRO":
        return "Business Pro";
      default:
        return tier;
    }
  };

  const getUsageColor = (current: number, limit: number) => {
    const percentage = (current / limit) * 100;
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 75) return "text-yellow-600";
    return "text-green-600";
  };

  const getProgressColor = (current: number, limit: number) => {
    const percentage = (current / limit) * 100;
    if (percentage >= 90) return "bg-red-600";
    if (percentage >= 75) return "bg-yellow-600";
    return "bg-green-600";
  };

  const holdingPercentage = Math.min(
    (usage.usage.holding / usage.limits.packageHolding) * 100,
    100,
  );
  const allowancePercentage = Math.min(
    (usage.usage.allowance / usage.limits.packageAllowance) * 100,
    100,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Metered Usage
          </div>
          <Badge variant="outline">
            {formatSubscriptionTier(usage.subscription)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Package Holding Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Package Holding</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-medium ${getUsageColor(usage.usage.holding, usage.limits.packageHolding)}`}
              >
                {usage.usage.holding} / {usage.limits.packageHolding} days
              </span>
              {usage.usage.holding <= usage.limits.packageHolding ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
            </div>
          </div>
          <Progress
            value={holdingPercentage}
            className="h-2"
            style={{
              backgroundColor: "#e5e7eb",
            }}
          />
          <div className="text-xs text-gray-500">
            {Math.round(holdingPercentage)}% of your{" "}
            {usage.limits.packageHolding}-day holding allowance
          </div>
        </div>

        {/* Package Allowance Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Package Allowance</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-medium ${getUsageColor(usage.usage.allowance, usage.limits.packageAllowance)}`}
              >
                {usage.usage.allowance} / {usage.limits.packageAllowance}{" "}
                packages
              </span>
              {usage.usage.allowance <= usage.limits.packageAllowance ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
            </div>
          </div>
          <Progress
            value={allowancePercentage}
            className="h-2"
            style={{
              backgroundColor: "#e5e7eb",
            }}
          />
          <div className="text-xs text-gray-500">
            {Math.round(allowancePercentage)}% of your{" "}
            {usage.limits.packageAllowance}-package allowance
          </div>
        </div>

        {/* Billing Period */}
        <div className="border-t border-gray-200 pt-4">
          <div className="text-xs text-gray-500">
            Billing Period: {usage.period.start.toLocaleDateString()} -{" "}
            {usage.period.end.toLocaleDateString()}
          </div>
        </div>

        {/* Warnings */}
        {(usage.usage.holding > usage.limits.packageHolding ||
          usage.usage.allowance > usage.limits.packageAllowance) && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                You've exceeded your usage limits
              </span>
            </div>
            <p className="mt-1 text-xs text-red-700">
              Additional charges may apply. Consider upgrading your plan.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
