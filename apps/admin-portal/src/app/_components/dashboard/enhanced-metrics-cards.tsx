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

// Mock data that matches the expected Prisma types structure
// This will be replaced with real data from the API later
const mockMetricsData = {
  totalPackages: 1847,
  totalPackagesChange: 12.3,
  currentUtilization: 76.4,
  currentUtilizationChange: 8.2,
  avgDailyUtilization: 68.7,
  avgDailyUtilizationChange: 5.1,
  avgPickupTime: 28.4, // hours
  avgPickupTimeChange: -12.7,
  uniqueCustomers: 342,
  uniqueCustomersChange: 18.9,
  avgProcessingTime: 1.8, // hours
  avgProcessingTimeChange: -23.4,
};

export function EnhancedMetricsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <MetricCard
        title="Total Packages"
        value={mockMetricsData.totalPackages}
        change={mockMetricsData.totalPackagesChange}
        icon={Package}
        format="number"
      />

      <MetricCard
        title="Current Utilization"
        value={mockMetricsData.currentUtilization}
        change={mockMetricsData.currentUtilizationChange}
        icon={Gauge}
        format="percentage"
        utilization={mockMetricsData.currentUtilization}
      />

      <MetricCard
        title="Avg Daily Utilization"
        value={mockMetricsData.avgDailyUtilization}
        change={mockMetricsData.avgDailyUtilizationChange}
        icon={TrendingUp}
        format="percentage"
        utilization={mockMetricsData.avgDailyUtilization}
      />

      <MetricCard
        title="Avg Pickup Time"
        value={mockMetricsData.avgPickupTime}
        change={mockMetricsData.avgPickupTimeChange}
        icon={Clock}
        format="time"
      />

      <MetricCard
        title="Unique Customers"
        value={mockMetricsData.uniqueCustomers}
        change={mockMetricsData.uniqueCustomersChange}
        icon={Users}
        format="number"
      />

      <MetricCard
        title="Processing Time"
        value={mockMetricsData.avgProcessingTime}
        change={mockMetricsData.avgProcessingTimeChange}
        icon={Timer}
        format="time"
      />
    </div>
  );
}
