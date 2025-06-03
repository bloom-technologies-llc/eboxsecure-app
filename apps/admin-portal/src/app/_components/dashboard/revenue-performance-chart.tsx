"use client";

import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ebox/ui/card";
import { Skeleton } from "@ebox/ui/skeleton";

import { api } from "../../../trpc/react";

interface RevenuePerformanceChartProps {
  locationId?: number;
  dateRange: {
    from: Date;
    to: Date;
  };
  className?: string;
}

export function RevenuePerformanceChart({
  locationId,
  dateRange,
  className,
}: RevenuePerformanceChartProps) {
  // TODO: Add Redis caching for performance optimization
  const {
    data: revenueData,
    isLoading,
    error,
  } = api.analytics.getRevenueAnalytics.useQuery({
    locationId,
    dateRange,
  });

  // Get all locations data for comparison when no specific location is selected
  const { data: utilizationData, isLoading: isLoadingUtilization } =
    api.analytics.getUtilizationMetrics.useQuery(
      {
        dateRange,
      },
      {
        enabled: !locationId, // Only fetch when no specific location is selected
      },
    );

  const isLoading2 = isLoading || (!locationId && isLoadingUtilization);

  if (isLoading2) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Revenue Performance</CardTitle>
          <CardDescription>
            Revenue breakdown and trends for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-64 w-full" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Revenue Performance</CardTitle>
          <CardDescription>
            Revenue breakdown and trends for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p>Failed to load revenue analytics</p>
              <p className="text-sm">Please try again later</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!revenueData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Revenue Performance</CardTitle>
          <CardDescription>
            Revenue breakdown and trends for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p>No revenue data available</p>
              <p className="text-sm">Try selecting a different date range</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If single location, show monthly trend
  const monthlyChartData = revenueData.monthlyRevenueTrend || [];

  // If all locations, show revenue by location (from utilization data)
  const locationChartData =
    !locationId && utilizationData && Array.isArray(utilizationData)
      ? utilizationData.map((location) => ({
          location: location.locationName,
          revenue: 0, // We don't have individual location revenue, so show 0
          packages: location.currentPackageCount,
          revenuePerPackage: 0,
        }))
      : [];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Revenue Performance</CardTitle>
        <CardDescription>
          Revenue breakdown and trends for the selected period
          {locationId && (
            <span className="block text-sm">Location-specific data</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Revenue Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                ${Math.round(revenueData.totalRevenue).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Revenue</div>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {revenueData.packageCount.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Packages
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                ${Math.round(revenueData.averageRevenuePerPackage * 100) / 100}
              </div>
              <div className="text-sm text-muted-foreground">
                Avg per Package
              </div>
            </div>
          </div>

          {/* Charts */}
          {locationId && monthlyChartData.length > 0 ? (
            /* Monthly Trend for Single Location */
            <div>
              <h4 className="mb-3 text-sm font-semibold">
                Monthly Revenue Trend
              </h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyChartData}>
                  <XAxis
                    dataKey="month"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value) => [
                      `$${Number(value).toLocaleString()}`,
                      "Revenue",
                    ]}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#8884d8"
                    name="Revenue"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : !locationId && locationChartData.length > 0 ? (
            /* Package Count by Location (as proxy for revenue) */
            <div>
              <h4 className="mb-3 text-sm font-semibold">
                Package Count by Location
              </h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={locationChartData}>
                  <XAxis
                    dataKey="location"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0]?.payload;
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-sm">
                            <div className="grid gap-2">
                              <div className="font-semibold">{label}</div>
                              <div>
                                <div className="text-[0.70rem] uppercase text-muted-foreground">
                                  Current Packages
                                </div>
                                <div className="font-bold text-blue-600">
                                  {data?.packages}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="packages"
                    fill="#8884d8"
                    name="Packages"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              <p>No chart data available for the selected criteria</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
