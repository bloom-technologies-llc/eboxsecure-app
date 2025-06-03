"use client";

import { format, subDays } from "date-fns";
import {
  Legend,
  Line,
  LineChart,
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

interface UtilizationTrendsChartProps {
  locationId?: number;
  dateRange: {
    from: Date;
    to: Date;
  };
  className?: string;
}

export function UtilizationTrendsChart({
  locationId,
  dateRange,
  className,
}: UtilizationTrendsChartProps) {
  // TODO: Add Redis caching for performance optimization
  const {
    data: trendsData,
    isLoading,
    error,
  } = api.analytics.getUtilizationTrends.useQuery({
    locationId,
    dateRange,
  });

  const chartData = trendsData?.map((trend) => ({
    date: format(new Date(trend.date), "MMM dd"),
    fullDate: trend.date,
    currentUtilization: Math.round(trend.currentUtilization * 10) / 10,
    avgDailyUtilization: Math.round(trend.averageDailyUtilization * 10) / 10,
    packages: trend.packageCount,
  }));

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Utilization Trends</CardTitle>
          <CardDescription>
            Current vs. average daily utilization over the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-64 w-full" />
            <div className="flex space-x-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
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
          <CardTitle>Utilization Trends</CardTitle>
          <CardDescription>
            Current vs. average daily utilization over the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p>Failed to load utilization trends</p>
              <p className="text-sm">Please try again later</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Utilization Trends</CardTitle>
          <CardDescription>
            Current vs. average daily utilization over the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p>No utilization data available</p>
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
        <CardTitle>Utilization Trends</CardTitle>
        <CardDescription>
          Current vs. average daily utilization over the selected period
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <XAxis
              dataKey="date"
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
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Date
                          </span>
                          <span className="font-bold text-muted-foreground">
                            {label}
                          </span>
                        </div>
                        {payload.map((entry, index) => (
                          <div key={index} className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              {entry.name}
                            </span>
                            <span
                              className="font-bold"
                              style={{ color: entry.color }}
                            >
                              {entry.value}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="currentUtilization"
              stroke="#8884d8"
              strokeWidth={2}
              name="Current Utilization"
              dot={{ fill: "#8884d8", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#8884d8", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="avgDailyUtilization"
              stroke="#82ca9d"
              strokeWidth={2}
              name="Avg Daily Utilization"
              dot={{ fill: "#82ca9d", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#82ca9d", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
