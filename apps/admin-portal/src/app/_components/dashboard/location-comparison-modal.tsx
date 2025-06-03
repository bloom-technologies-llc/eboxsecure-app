"use client";

import { useState } from "react";
import { BarChart3, Minus, TrendingDown, TrendingUp, X } from "lucide-react";
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@ebox/ui/badge";
import { Button } from "@ebox/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ebox/ui/card";
import { Checkbox } from "@ebox/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@ebox/ui/dialog";

// Mock location data
const mockLocations = [
  { id: 1, name: "Location A", storageCapacity: 500 },
  { id: 2, name: "Location B", storageCapacity: 350 },
  { id: 3, name: "Location C", storageCapacity: 750 },
  { id: 4, name: "Location D", storageCapacity: 400 },
  { id: 5, name: "Location E", storageCapacity: 600 },
];

// Mock comparison data for each location
const mockComparisonData = {
  1: {
    // Location A
    currentUtilization: 76.4,
    avgDailyUtilization: 68.7,
    avgPickupTime: 28.4,
    uniqueCustomers: 342,
    totalPackages: 1847,
    revenue: 12450,
    avgProcessingTime: 1.8,
  },
  2: {
    // Location B
    currentUtilization: 62.8,
    avgDailyUtilization: 55.3,
    avgPickupTime: 32.1,
    uniqueCustomers: 287,
    totalPackages: 1456,
    revenue: 9875,
    avgProcessingTime: 2.1,
  },
  3: {
    // Location C
    currentUtilization: 86.7,
    avgDailyUtilization: 78.9,
    avgPickupTime: 24.6,
    uniqueCustomers: 429,
    totalPackages: 2341,
    revenue: 15230,
    avgProcessingTime: 1.5,
  },
  4: {
    // Location D
    currentUtilization: 45.2,
    avgDailyUtilization: 41.8,
    avgPickupTime: 36.8,
    uniqueCustomers: 198,
    totalPackages: 892,
    revenue: 7650,
    avgProcessingTime: 2.4,
  },
  5: {
    // Location E
    currentUtilization: 70.3,
    avgDailyUtilization: 64.2,
    avgPickupTime: 29.7,
    uniqueCustomers: 315,
    totalPackages: 1678,
    revenue: 11320,
    avgProcessingTime: 1.9,
  },
};

interface LocationComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LocationComparisonModal({
  open,
  onOpenChange,
}: LocationComparisonModalProps) {
  const [selectedLocationIds, setSelectedLocationIds] = useState<number[]>([
    1, 3,
  ]);

  const handleLocationToggle = (locationId: number, checked: boolean) => {
    if (checked) {
      if (selectedLocationIds.length < 4) {
        setSelectedLocationIds([...selectedLocationIds, locationId]);
      }
    } else {
      setSelectedLocationIds(
        selectedLocationIds.filter((id) => id !== locationId),
      );
    }
  };

  const calculatePercentageDifference = (value1: number, value2: number) => {
    if (value2 === 0) return 0;
    return ((value1 - value2) / value2) * 100;
  };

  const getDifferenceIcon = (diff: number) => {
    if (Math.abs(diff) < 1)
      return <Minus className="h-3 w-3 text-muted-foreground" />;
    if (diff > 0) return <TrendingUp className="h-3 w-3 text-green-600" />;
    return <TrendingDown className="h-3 w-3 text-red-600" />;
  };

  const getDifferenceColor = (diff: number) => {
    if (Math.abs(diff) < 1) return "text-muted-foreground";
    if (diff > 0) return "text-green-600";
    return "text-red-600";
  };

  const selectedLocations = mockLocations.filter((loc) =>
    selectedLocationIds.includes(loc.id),
  );
  const comparisonMetrics = selectedLocationIds.map((id) => ({
    locationId: id,
    locationName: mockLocations.find((loc) => loc.id === id)?.name || "",
    ...mockComparisonData[id as keyof typeof mockComparisonData],
  }));

  // Create chart data for comparative visualization
  const chartData = [
    {
      metric: "Current Utilization",
      ...comparisonMetrics.reduce(
        (acc, loc) => ({
          ...acc,
          [loc.locationName]: loc.currentUtilization,
        }),
        {},
      ),
    },
    {
      metric: "Avg Daily Utilization",
      ...comparisonMetrics.reduce(
        (acc, loc) => ({
          ...acc,
          [loc.locationName]: loc.avgDailyUtilization,
        }),
        {},
      ),
    },
    {
      metric: "Avg Pickup Time",
      ...comparisonMetrics.reduce(
        (acc, loc) => ({
          ...acc,
          [loc.locationName]: loc.avgPickupTime,
        }),
        {},
      ),
    },
    {
      metric: "Processing Time",
      ...comparisonMetrics.reduce(
        (acc, loc) => ({
          ...acc,
          [loc.locationName]: loc.avgProcessingTime,
        }),
        {},
      ),
    },
  ];

  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Location Performance Comparison
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Location Selection */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">
              Select Locations to Compare (2-4 locations)
            </h3>
            <div className="grid grid-cols-5 gap-3">
              {mockLocations.map((location) => (
                <div key={location.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`location-${location.id}`}
                    checked={selectedLocationIds.includes(location.id)}
                    onCheckedChange={(checked) =>
                      handleLocationToggle(location.id, checked as boolean)
                    }
                    disabled={
                      !selectedLocationIds.includes(location.id) &&
                      selectedLocationIds.length >= 4
                    }
                  />
                  <label
                    htmlFor={`location-${location.id}`}
                    className="cursor-pointer text-sm font-medium"
                  >
                    {location.name}
                  </label>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Selected: {selectedLocationIds.length}/4 locations
            </p>
          </div>

          {selectedLocationIds.length >= 2 && (
            <>
              {/* Key Metrics Comparison */}
              <div>
                <h3 className="mb-3 text-sm font-semibold">
                  Key Metrics Comparison
                </h3>
                <div className="grid gap-4">
                  {/* Current Utilization */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">
                        Current Utilization Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div
                        className="grid gap-3"
                        style={{
                          gridTemplateColumns: `repeat(${selectedLocationIds.length}, 1fr)`,
                        }}
                      >
                        {comparisonMetrics.map((metric, index) => {
                          const baseline =
                            comparisonMetrics[0]?.currentUtilization || 0;
                          const diff =
                            index > 0
                              ? calculatePercentageDifference(
                                  metric.currentUtilization,
                                  baseline,
                                )
                              : 0;

                          return (
                            <div
                              key={metric.locationId}
                              className="rounded-lg bg-muted/50 p-3 text-center"
                            >
                              <div className="text-sm font-semibold text-muted-foreground">
                                {metric.locationName}
                              </div>
                              <div className="mt-1 text-2xl font-bold">
                                {metric.currentUtilization}%
                              </div>
                              {index > 0 && (
                                <div
                                  className={`mt-1 flex items-center justify-center text-xs ${getDifferenceColor(diff)}`}
                                >
                                  {getDifferenceIcon(diff)}
                                  <span className="ml-1">
                                    {diff > 0 ? "+" : ""}
                                    {diff.toFixed(1)}%
                                  </span>
                                </div>
                              )}
                              {index === 0 && (
                                <Badge
                                  variant="outline"
                                  className="mt-1 text-xs"
                                >
                                  Baseline
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Average Pickup Time */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">
                        Average Pickup Time
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div
                        className="grid gap-3"
                        style={{
                          gridTemplateColumns: `repeat(${selectedLocationIds.length}, 1fr)`,
                        }}
                      >
                        {comparisonMetrics.map((metric, index) => {
                          const baseline =
                            comparisonMetrics[0]?.avgPickupTime || 0;
                          const diff =
                            index > 0
                              ? calculatePercentageDifference(
                                  metric.avgPickupTime,
                                  baseline,
                                )
                              : 0;

                          return (
                            <div
                              key={metric.locationId}
                              className="rounded-lg bg-muted/50 p-3 text-center"
                            >
                              <div className="text-sm font-semibold text-muted-foreground">
                                {metric.locationName}
                              </div>
                              <div className="mt-1 text-2xl font-bold">
                                {metric.avgPickupTime}h
                              </div>
                              {index > 0 && (
                                <div
                                  className={`mt-1 flex items-center justify-center text-xs ${getDifferenceColor(-diff)}`}
                                >
                                  {getDifferenceIcon(-diff)}
                                  <span className="ml-1">
                                    {diff > 0 ? "+" : ""}
                                    {diff.toFixed(1)}%
                                  </span>
                                </div>
                              )}
                              {index === 0 && (
                                <Badge
                                  variant="outline"
                                  className="mt-1 text-xs"
                                >
                                  Baseline
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Revenue Comparison */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div
                        className="grid gap-3"
                        style={{
                          gridTemplateColumns: `repeat(${selectedLocationIds.length}, 1fr)`,
                        }}
                      >
                        {comparisonMetrics.map((metric, index) => {
                          const baseline = comparisonMetrics[0]?.revenue || 0;
                          const diff =
                            index > 0
                              ? calculatePercentageDifference(
                                  metric.revenue,
                                  baseline,
                                )
                              : 0;

                          return (
                            <div
                              key={metric.locationId}
                              className="rounded-lg bg-muted/50 p-3 text-center"
                            >
                              <div className="text-sm font-semibold text-muted-foreground">
                                {metric.locationName}
                              </div>
                              <div className="mt-1 text-2xl font-bold">
                                ${metric.revenue.toLocaleString()}
                              </div>
                              {index > 0 && (
                                <div
                                  className={`mt-1 flex items-center justify-center text-xs ${getDifferenceColor(diff)}`}
                                >
                                  {getDifferenceIcon(diff)}
                                  <span className="ml-1">
                                    {diff > 0 ? "+" : ""}
                                    {diff.toFixed(1)}%
                                  </span>
                                </div>
                              )}
                              {index === 0 && (
                                <Badge
                                  variant="outline"
                                  className="mt-1 text-xs"
                                >
                                  Baseline
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Comparative Charts */}
              <div>
                <h3 className="mb-3 text-sm font-semibold">
                  Performance Comparison Chart
                </h3>
                <Card>
                  <CardContent className="pt-6">
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={chartData}>
                        <XAxis
                          dataKey="metric"
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
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="rounded-lg border bg-background p-3 shadow-sm">
                                  <div className="mb-2 font-semibold">
                                    {label}
                                  </div>
                                  <div className="space-y-1">
                                    {payload.map((entry, index) => (
                                      <div
                                        key={index}
                                        className="flex items-center justify-between gap-4"
                                      >
                                        <div className="flex items-center gap-2">
                                          <div
                                            className="h-3 w-3 rounded"
                                            style={{
                                              backgroundColor: entry.color,
                                            }}
                                          />
                                          <span className="text-sm">
                                            {entry.dataKey}
                                          </span>
                                        </div>
                                        <span className="font-bold">
                                          {typeof entry.value === "number"
                                            ? entry.value.toFixed(1)
                                            : entry.value}
                                          {label.includes("Utilization")
                                            ? "%"
                                            : label.includes("Time")
                                              ? "h"
                                              : ""}
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
                        {comparisonMetrics.map((metric, index) => (
                          <Bar
                            key={metric.locationId}
                            dataKey={metric.locationName}
                            fill={colors[index % colors.length]}
                            radius={[2, 2, 0, 0]}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Export Comparison Data */}
              <div className="flex justify-end border-t pt-4">
                <Button
                  variant="outline"
                  onClick={() =>
                    alert("Comparison export will be available in Phase 4")
                  }
                >
                  Export Comparison Data
                </Button>
              </div>
            </>
          )}

          {selectedLocationIds.length < 2 && (
            <div className="py-8 text-center text-muted-foreground">
              <BarChart3 className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p className="text-lg font-semibold">
                Select at least 2 locations to compare
              </p>
              <p className="text-sm">
                Choose locations from the list above to see detailed comparisons
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
