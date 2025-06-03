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

// Generate mock heatmap data for peak capacity analysis
function generateMockHeatmapData() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return days.map((day) => ({
    day,
    hours: hours.map((hour) => {
      // Simulate realistic patterns:
      // - Higher utilization during business hours (9-17)
      // - Peak during lunch (12-13) and evening (17-19)
      // - Lower on weekends
      let baseUtilization = 30;

      if (day === "Sat" || day === "Sun") {
        baseUtilization = 20; // Lower on weekends
      }

      if (hour >= 9 && hour <= 17) {
        baseUtilization += 25; // Business hours boost
      }

      if (hour >= 12 && hour <= 13) {
        baseUtilization += 20; // Lunch peak
      }

      if (hour >= 17 && hour <= 19) {
        baseUtilization += 30; // Evening peak
      }

      // Add some randomness
      const noise = (Math.random() - 0.5) * 15;
      const utilization = Math.max(0, Math.min(100, baseUtilization + noise));

      return {
        hour,
        utilization: Math.round(utilization),
        packageCount: Math.round((utilization / 100) * 45 + Math.random() * 10),
      };
    }),
  }));
}

const mockHeatmapData = generateMockHeatmapData();

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

interface PeakCapacityHeatmapProps {
  className?: string;
}

export function PeakCapacityHeatmap({ className }: PeakCapacityHeatmapProps) {
  // Calculate peak hours across all days
  const hourlyAverages = Array.from({ length: 24 }, (_, hour) => {
    const hourData = mockHeatmapData.flatMap((day) =>
      day.hours.filter((h) => h.hour === hour),
    );
    const avgUtilization =
      hourData.reduce((sum, h) => sum + h.utilization, 0) / hourData.length;
    return {
      hour,
      avgUtilization: Math.round(avgUtilization),
      totalPackages: hourData.reduce((sum, h) => sum + h.packageCount, 0),
    };
  });

  const peakHours = hourlyAverages
    .sort((a, b) => b.avgUtilization - a.avgUtilization)
    .slice(0, 3);

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
              {mockHeatmapData.map((dayData) => (
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
                      title={`${dayData.day} ${hourData.hour}:00 - ${hourData.utilization}% utilization (${hourData.packageCount} packages)`}
                    >
                      {hourData.utilization}
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
              {peakHours.map((peak, index) => (
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
                    {peak.totalPackages} packages/week
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Pattern Summary */}
          <div>
            <h4 className="mb-3 text-sm font-semibold">Weekly Pattern</h4>
            <div className="grid grid-cols-7 gap-2">
              {mockHeatmapData.map((dayData) => {
                const dayAvg = Math.round(
                  dayData.hours.reduce((sum, h) => sum + h.utilization, 0) /
                    dayData.hours.length,
                );
                const dayPeak = Math.max(
                  ...dayData.hours.map((h) => h.utilization),
                );

                return (
                  <div
                    key={dayData.day}
                    className="rounded-lg bg-muted/50 p-2 text-center"
                  >
                    <div className="text-sm font-semibold">{dayData.day}</div>
                    <div className="mt-1 text-lg font-bold">{dayAvg}%</div>
                    <div className="text-xs text-muted-foreground">avg</div>
                    <div className="text-xs text-muted-foreground">
                      peak: {dayPeak}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
