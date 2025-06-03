"use client";

import React from "react";

import { cn } from "@ebox/ui";
import { Badge } from "@ebox/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ebox/ui/card";
import { Skeleton } from "@ebox/ui/skeleton";

import { api } from "../../../trpc/react";

interface PeakCapacityHeatmapProps {
  locationId?: number;
  dateRange: {
    from: Date;
    to: Date;
  };
  className?: string;
}

export function PeakCapacityHeatmap({
  locationId,
  dateRange,
  className,
}: PeakCapacityHeatmapProps) {
  // TODO: Add Redis caching for performance optimization
  const {
    data: peakCapacityData,
    isLoading,
    error,
  } = api.analytics.getPeakCapacityAnalysis.useQuery({
    locationId,
    dateRange,
    granularity: "hourly",
  });

  // Helper function to get color based on utilization
  const getUtilizationColor = (utilization: number) => {
    if (utilization < 30) return "bg-green-100 text-green-800";
    if (utilization < 50) return "bg-green-200 text-green-900";
    if (utilization < 70) return "bg-yellow-200 text-yellow-900";
    if (utilization < 85) return "bg-orange-200 text-orange-900";
    return "bg-red-200 text-red-900";
  };

  // Helper function to get intensity for background
  const getIntensity = (utilization: number) => {
    if (utilization < 30) return "opacity-30";
    if (utilization < 50) return "opacity-50";
    if (utilization < 70) return "opacity-70";
    if (utilization < 85) return "opacity-85";
    return "opacity-100";
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Peak Capacity Analysis</CardTitle>
          <CardDescription>
            Utilization patterns by day of week and hour of day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Heatmap skeleton */}
            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: "auto repeat(24, 1fr)" }}
            >
              <div></div>
              {Array.from({ length: 24 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-4" />
              ))}
              {Array.from({ length: 7 }).map((_, dayIndex) => (
                <React.Fragment key={dayIndex}>
                  <Skeleton className="h-8 w-8" />
                  {Array.from({ length: 24 }).map((_, hourIndex) => (
                    <Skeleton key={hourIndex} className="h-8 w-8" />
                  ))}
                </React.Fragment>
              ))}
            </div>

            {/* Legend skeleton */}
            <div className="flex items-center gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-1">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>

            {/* Peak hours skeleton */}
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-lg bg-muted/50 p-3 text-center">
                  <Skeleton className="mx-auto mb-2 h-5 w-12" />
                  <Skeleton className="mx-auto mb-1 h-6 w-8" />
                  <Skeleton className="mx-auto mb-1 h-3 w-20" />
                  <Skeleton className="mx-auto h-3 w-16" />
                </div>
              ))}
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
          <CardTitle>Peak Capacity Analysis</CardTitle>
          <CardDescription>
            Utilization patterns by day of week and hour of day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p>Failed to load peak capacity data</p>
              <p className="text-sm">Please try again later</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!peakCapacityData || peakCapacityData.granularity !== "hourly") {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Peak Capacity Analysis</CardTitle>
          <CardDescription>
            Utilization patterns by day of week and hour of day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p>No peak capacity data available</p>
              <p className="text-sm">
                Try adjusting your date range or location selection
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(className, "flex h-fit flex-col")}>
      <CardHeader>
        <CardTitle>Peak Capacity Analysis</CardTitle>
        <CardDescription>
          Utilization patterns by day of week and hour of day
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Heatmap */}
          <div>
            <div
              className="grid gap-1 text-xs"
              style={{ gridTemplateColumns: "auto repeat(24, 1fr)" }}
            >
              {/* Header row with hours */}
              <div></div> {/* Empty corner */}
              {Array.from({ length: 24 }, (_, i) => (
                <div
                  key={i}
                  className="text-center font-medium text-muted-foreground"
                >
                  {i}
                </div>
              ))}
              {/* Data rows */}
              {peakCapacityData.heatmapData.map((dayData) => (
                <React.Fragment key={dayData.day}>
                  {/* Day label */}
                  <div className="flex items-center pr-2 text-right font-medium text-muted-foreground">
                    {dayData.day}
                  </div>

                  {/* Hour cells */}
                  {dayData.hours.map((hourData) => (
                    <div
                      key={`${dayData.day}-${hourData.hour}`}
                      className={cn(
                        "flex h-8 cursor-pointer items-center justify-center rounded text-xs font-medium transition-all hover:scale-105",
                        getUtilizationColor(hourData.utilization),
                        getIntensity(hourData.utilization),
                      )}
                      title={`${dayData.day} ${hourData.hour}:00 - ${hourData.utilization}% utilization (${hourData.packageCount} avg packages)`}
                    >
                      {Math.round(hourData.utilization)}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div>
            <h4 className="mb-2 text-sm font-semibold">Utilization Legend</h4>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="h-4 w-4 rounded bg-green-200"></div>
                <span>Low (0-30%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-4 w-4 rounded bg-yellow-200"></div>
                <span>Moderate (30-70%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-4 w-4 rounded bg-orange-200"></div>
                <span>High (70-85%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-4 w-4 rounded bg-red-200"></div>
                <span>Critical (85%+)</span>
              </div>
            </div>
          </div>

          {/* Peak Hours Summary */}
          <div>
            <h4 className="mb-3 text-sm font-semibold">Peak Hours Summary</h4>
            <div className="grid grid-cols-3 gap-4">
              {peakCapacityData.peakHours.map((peak, index) => (
                <div
                  key={peak.hour}
                  className="rounded-lg bg-muted/50 p-3 text-center"
                >
                  <Badge
                    variant={
                      index === 0
                        ? "destructive"
                        : index === 1
                          ? "secondary"
                          : "outline"
                    }
                    className="mb-2"
                  >
                    #{index + 1} Peak
                  </Badge>
                  <div className="text-lg font-bold">{peak.hour}:00</div>
                  <div className="text-sm text-muted-foreground">
                    {peak.avgUtilization}% avg utilization
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {peak.totalPackages} packages total
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Pattern Summary */}
          <div>
            <h4 className="mb-3 text-sm font-semibold">Weekly Pattern</h4>
            <div className="grid grid-cols-7 gap-2">
              {peakCapacityData.weeklyPatterns.map((dayData) => (
                <div
                  key={dayData.day}
                  className="rounded-lg bg-muted/50 p-2 text-center"
                >
                  <div className="text-sm font-semibold">{dayData.day}</div>
                  <div className="mt-1 text-lg font-bold">
                    {dayData.avgUtilization}%
                  </div>
                  <div className="text-xs text-muted-foreground">avg</div>
                  <div className="text-xs text-muted-foreground">
                    peak: {dayData.peakUtilization}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Insights Summary */}
          <div>
            <h4 className="mb-3 text-sm font-semibold">Key Insights</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="font-medium text-muted-foreground">
                  Busiest Hour
                </div>
                <div className="text-lg font-bold">
                  {peakCapacityData.insights.busiestHour}:00
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="font-medium text-muted-foreground">
                  Busiest Day
                </div>
                <div className="text-lg font-bold">
                  {peakCapacityData.insights.busiestDay}
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="font-medium text-muted-foreground">
                  Average Utilization
                </div>
                <div className="text-lg font-bold">
                  {peakCapacityData.insights.averageUtilization}%
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="font-medium text-muted-foreground">
                  Peak Utilization
                </div>
                <div className="text-lg font-bold">
                  {peakCapacityData.insights.peakUtilization}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
