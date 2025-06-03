"use client";

import {
  ArrowDown,
  ArrowUp,
  Clock,
  Gauge,
  Minus,
  Package,
  Timer,
  TrendingUp,
  Users,
} from "lucide-react";

import { cn } from "@ebox/ui";
import { Badge } from "@ebox/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@ebox/ui/card";

import { api } from "~/trpc/react";
import { ErrorState, MetricsCardSkeleton } from "./loading-states";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  utilization?: number; // For utilization cards to show color coding
  format?: "number" | "percentage" | "currency" | "time";
}

function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  utilization,
  format = "number",
}: MetricCardProps) {
  const getUtilizationColor = (util?: number) => {
    if (!util) return "";
    if (util < 70) return "text-green-600";
    if (util < 85) return "text-yellow-600";
    return "text-red-600";
  };

  const getChangeIcon = (change?: number) => {
    if (!change) return <Minus className="h-3 w-3" />;
    if (change > 0) return <ArrowUp className="h-3 w-3" />;
    return <ArrowDown className="h-3 w-3" />;
  };

  const getChangeColor = (change?: number) => {
    if (!change) return "text-muted-foreground";
    if (change > 0) return "text-green-600";
    return "text-red-600";
  };

  const formatValue = (val: string | number, fmt: string) => {
    if (typeof val === "string") return val;

    switch (fmt) {
      case "percentage":
        return `${val}%`;
      case "currency":
        return `$${val.toLocaleString()}`;
      case "time":
        return `${val} hrs`;
      default:
        return val.toLocaleString();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div
          className={cn("text-2xl font-bold", getUtilizationColor(utilization))}
        >
          {formatValue(value, format)}
        </div>
        {change !== undefined && (
          <div
            className={cn("flex items-center text-xs", getChangeColor(change))}
          >
            {getChangeIcon(change)}
            <span className="ml-1">
              {Math.abs(change)}% {changeLabel || "from last month"}
            </span>
          </div>
        )}
        {utilization !== undefined && (
          <div className="mt-1">
            <Badge
              variant={
                utilization < 70
                  ? "default"
                  : utilization < 85
                    ? "secondary"
                    : "destructive"
              }
              className="text-xs"
            >
              {utilization < 70
                ? "Good"
                : utilization < 85
                  ? "Moderate"
                  : "High"}{" "}
              Utilization
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface EnhancedMetricsCardsProps {
  locationId?: number;
  dateRange: {
    from: Date;
    to: Date;
  };
}

export function EnhancedMetricsCards({
  locationId,
  dateRange,
}: EnhancedMetricsCardsProps) {
  // Fetch utilization metrics
  const {
    data: utilizationData,
    isLoading: isLoadingUtilization,
    error: utilizationError,
    refetch: refetchUtilization,
  } = api.analytics.getUtilizationMetrics.useQuery({
    locationId,
    dateRange,
  });

  // Fetch pickup analytics
  const {
    data: pickupData,
    isLoading: isLoadingPickup,
    error: pickupError,
    refetch: refetchPickup,
  } = api.analytics.getPickupAnalytics.useQuery({
    locationId,
    dateRange,
  });

  // Fetch customer usage metrics
  const {
    data: customerData,
    isLoading: isLoadingCustomers,
    error: customerError,
    refetch: refetchCustomers,
  } = api.analytics.getCustomerUsageMetrics.useQuery({
    locationId,
    dateRange,
  });

  // Fetch processing time analytics
  const {
    data: processingData,
    isLoading: isLoadingProcessing,
    error: processingError,
    refetch: refetchProcessing,
  } = api.analytics.getProcessingTimeAnalytics.useQuery({
    locationId,
    dateRange,
  });

  const isLoading =
    isLoadingUtilization ||
    isLoadingPickup ||
    isLoadingCustomers ||
    isLoadingProcessing;
  const hasError =
    utilizationError || pickupError || customerError || processingError;

  const handleRetry = () => {
    refetchUtilization();
    refetchPickup();
    refetchCustomers();
    refetchProcessing();
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <MetricsCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <ErrorState
        title="Failed to load metrics"
        description="Unable to fetch analytics data. Please try again."
        onRetry={handleRetry}
      />
    );
  }

  // TODO: Calculate actual percentage changes by comparing with previous period
  // For now using mock changes until historical comparison is implemented
  const mockChanges = {
    totalPackagesChange: 12.3,
    currentUtilizationChange: 8.2,
    avgDailyUtilizationChange: 5.1,
    avgPickupTimeChange: -12.7,
    uniqueCustomersChange: 18.9,
    avgProcessingTimeChange: -23.4,
  };

  // Extract values for single location or aggregate for all locations
  let totalPackages = 0;
  let currentUtilization = 0;
  let avgDailyUtilization = 0;

  if (Array.isArray(utilizationData)) {
    // All locations data
    totalPackages = utilizationData.reduce(
      (sum, loc) => sum + loc.currentPackageCount,
      0,
    );
    const totalCapacity = utilizationData.reduce(
      (sum, loc) => sum + loc.storageCapacity,
      0,
    );
    currentUtilization =
      totalCapacity > 0 ? (totalPackages / totalCapacity) * 100 : 0;
    avgDailyUtilization =
      utilizationData.reduce(
        (sum, loc) => sum + loc.averageDailyUtilization,
        0,
      ) / utilizationData.length;
  } else if (utilizationData) {
    // Single location data
    totalPackages = utilizationData.currentPackageCount;
    currentUtilization = utilizationData.currentUtilization;
    avgDailyUtilization = utilizationData.averageDailyUtilization;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <MetricCard
        title="Total Packages"
        value={totalPackages}
        change={mockChanges.totalPackagesChange}
        icon={Package}
        format="number"
      />

      <MetricCard
        title="Current Utilization"
        value={Math.round(currentUtilization * 10) / 10}
        change={mockChanges.currentUtilizationChange}
        icon={Gauge}
        format="percentage"
        utilization={currentUtilization}
      />

      <MetricCard
        title="Avg Daily Utilization"
        value={Math.round(avgDailyUtilization * 10) / 10}
        change={mockChanges.avgDailyUtilizationChange}
        icon={TrendingUp}
        format="percentage"
        utilization={avgDailyUtilization}
      />

      <MetricCard
        title="Avg Pickup Time"
        value={Math.round((pickupData?.averagePickupTime || 0) * 10) / 10}
        change={mockChanges.avgPickupTimeChange}
        icon={Clock}
        format="time"
      />

      <MetricCard
        title="Unique Customers"
        value={customerData?.uniqueCustomers || 0}
        change={mockChanges.uniqueCustomersChange}
        icon={Users}
        format="number"
      />

      <MetricCard
        title="Processing Time"
        value={
          Math.round((processingData?.averageProcessingTime || 0) * 10) / 10
        }
        change={mockChanges.avgProcessingTimeChange}
        icon={Timer}
        format="time"
      />
    </div>
  );
}
