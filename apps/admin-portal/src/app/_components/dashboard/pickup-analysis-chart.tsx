"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
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

interface PickupAnalysisChartProps {
  locationId?: number;
  dateRange: {
    from: Date;
    to: Date;
  };
  className?: string;
}

export function PickupAnalysisChart({
  locationId,
  dateRange,
  className,
}: PickupAnalysisChartProps) {
  // TODO: Add Redis caching for performance optimization
  const {
    data: pickupData,
    isLoading,
    error,
  } = api.analytics.getPickupAnalytics.useQuery({
    locationId,
    dateRange,
  });

  const chartData = pickupData
    ? [
        {
          timeRange: "Same Day",
          count: pickupData.pickupDistribution.sameDay,
          percentage:
            Math.round(
              (pickupData.pickupDistribution.sameDay /
                (pickupData.pickupDistribution.sameDay +
                  pickupData.pickupDistribution.oneTwoDay +
                  pickupData.pickupDistribution.threeFiveDay +
                  pickupData.pickupDistribution.sixPlusDay)) *
                1000,
            ) / 10,
          avgHours: 12, // Estimate for same day
        },
        {
          timeRange: "1-2 Days",
          count: pickupData.pickupDistribution.oneTwoDay,
          percentage:
            Math.round(
              (pickupData.pickupDistribution.oneTwoDay /
                (pickupData.pickupDistribution.sameDay +
                  pickupData.pickupDistribution.oneTwoDay +
                  pickupData.pickupDistribution.threeFiveDay +
                  pickupData.pickupDistribution.sixPlusDay)) *
                1000,
            ) / 10,
          avgHours: 36, // Estimate for 1-2 days
        },
        {
          timeRange: "3-5 Days",
          count: pickupData.pickupDistribution.threeFiveDay,
          percentage:
            Math.round(
              (pickupData.pickupDistribution.threeFiveDay /
                (pickupData.pickupDistribution.sameDay +
                  pickupData.pickupDistribution.oneTwoDay +
                  pickupData.pickupDistribution.threeFiveDay +
                  pickupData.pickupDistribution.sixPlusDay)) *
                1000,
            ) / 10,
          avgHours: 96, // Estimate for 3-5 days
        },
        {
          timeRange: "6+ Days",
          count: pickupData.pickupDistribution.sixPlusDay,
          percentage:
            Math.round(
              (pickupData.pickupDistribution.sixPlusDay /
                (pickupData.pickupDistribution.sameDay +
                  pickupData.pickupDistribution.oneTwoDay +
                  pickupData.pickupDistribution.threeFiveDay +
                  pickupData.pickupDistribution.sixPlusDay)) *
                1000,
            ) / 10,
          avgHours: 168, // Estimate for 6+ days
        },
      ]
    : [];

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Pickup Rate Analysis</CardTitle>
          <CardDescription>
            Package pickup time distribution and average pickup times
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-64 w-full" />
            <div className="grid grid-cols-4 gap-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
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
          <CardTitle>Pickup Rate Analysis</CardTitle>
          <CardDescription>
            Package pickup time distribution and average pickup times
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p>Failed to load pickup analytics</p>
              <p className="text-sm">Please try again later</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!pickupData || chartData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Pickup Rate Analysis</CardTitle>
          <CardDescription>
            Package pickup time distribution and average pickup times
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p>No pickup data available</p>
              <p className="text-sm">Try selecting a different date range</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Pickup Rate Analysis</CardTitle>
        <CardDescription>
          Package pickup time distribution and average pickup times
          {pickupData && (
            <span className="block text-sm">
              Average pickup time:{" "}
              {Math.round(pickupData.averagePickupTime * 10) / 10} hours
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timeRange"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="left"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}h`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0]?.payload;
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-sm">
                      <div className="grid gap-2">
                        <div className="font-semibold">{label}</div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-[0.70rem] uppercase text-muted-foreground">
                              Package Count
                            </div>
                            <div className="font-bold text-blue-600">
                              {data?.count} packages
                            </div>
                          </div>
                          <div>
                            <div className="text-[0.70rem] uppercase text-muted-foreground">
                              Percentage
                            </div>
                            <div className="font-bold text-green-600">
                              {data?.percentage}%
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-[0.70rem] uppercase text-muted-foreground">
                              Average Hours
                            </div>
                            <div className="font-bold text-orange-600">
                              {data?.avgHours}h
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="count"
              fill="#8884d8"
              name="Package Count"
              radius={[4, 4, 0, 0]}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="avgHours"
              stroke="#ff7300"
              strokeWidth={3}
              name="Avg Hours"
              dot={{ fill: "#ff7300", strokeWidth: 2, r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Summary stats */}
        <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
          {chartData.map((item, index) => (
            <div key={index} className="text-center">
              <div className="font-semibold text-muted-foreground">
                {item.timeRange}
              </div>
              <div className="text-lg font-bold">{item.percentage}%</div>
              <div className="text-xs text-muted-foreground">
                {item.count} packages
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
