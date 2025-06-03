"use client";

import { useState } from "react";
import { subDays } from "date-fns";
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
import { Skeleton } from "@ebox/ui/skeleton";

import { api } from "../../../trpc/react";

interface LocationComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDateRange?: {
    from: Date;
    to: Date;
  };
}

export function LocationComparisonModal({
  open,
  onOpenChange,
  defaultDateRange = {
    from: subDays(new Date(), 30),
    to: new Date(),
  },
}: LocationComparisonModalProps) {
  const [selectedLocationIds, setSelectedLocationIds] = useState<number[]>([]);

  // Get all locations
  const { data: locations, isLoading: isLoadingLocations } =
    api.analytics.getLocations.useQuery();

  // Get comparison data when locations are selected
  const { data: comparisonData, isLoading: isLoadingComparison } =
    api.analytics.getLocationComparison.useQuery(
      {
        locationIds: selectedLocationIds,
        dateRange: defaultDateRange,
      },
      {
        enabled: selectedLocationIds.length >= 2,
      },
    );

  // Initialize selected locations when locations are first loaded
  useState(() => {
    if (
      locations &&
      locations.length >= 2 &&
      selectedLocationIds.length === 0
    ) {
      setSelectedLocationIds([locations[0]!.id, locations[1]!.id]);
    }
  });

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

  if (isLoadingLocations) {
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
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!locations || locations.length < 2) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Location Performance Comparison
            </DialogTitle>
          </DialogHeader>
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p>Insufficient locations for comparison</p>
              <p className="text-sm">At least 2 locations are required</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Create chart data for comparative visualization
  const chartData = comparisonData
    ? [
        {
          metric: "Current Utilization (%)",
          ...comparisonData.locations.reduce(
            (acc, loc) => ({
              ...acc,
              [loc.location.name]: loc.metrics.utilization.current,
            }),
            {},
          ),
        },
        {
          metric: "Avg Daily Utilization (%)",
          ...comparisonData.locations.reduce(
            (acc, loc) => ({
              ...acc,
              [loc.location.name]: loc.metrics.utilization.average,
            }),
            {},
          ),
        },
        {
          metric: "Avg Pickup Time (hrs)",
          ...comparisonData.locations.reduce(
            (acc, loc) => ({
              ...acc,
              [loc.location.name]: loc.metrics.pickup.averageHours,
            }),
            {},
          ),
        },
        {
          metric: "Processing Time (hrs)",
          ...comparisonData.locations.reduce(
            (acc, loc) => ({
              ...acc,
              [loc.location.name]: loc.metrics.processing.avgProcessingHours,
            }),
            {},
          ),
        },
      ]
    : [];

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
              {locations.map((location) => (
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
                        {comparisonData?.locations.map((metric, index) => {
                          const baseline =
                            comparisonData?.locations[0]?.metrics.utilization
                              .current || 0;
                          const diff =
                            index > 0
                              ? calculatePercentageDifference(
                                  metric.metrics.utilization.current,
                                  baseline,
                                )
                              : 0;

                          return (
                            <div
                              key={metric.location.id}
                              className="rounded-lg bg-muted/50 p-3 text-center"
                            >
                              <div className="text-sm font-semibold text-muted-foreground">
                                {metric.location.name}
                              </div>
                              <div className="mt-1 text-2xl font-bold">
                                {metric.metrics.utilization.current}%
                              </div>
                              {index > 0 && (
                                <div
                                  className={`mt-1 flex items-center justify-center gap-1 text-xs ${getDifferenceColor(diff)}`}
                                >
                                  {getDifferenceIcon(diff)}
                                  <span>
                                    {diff > 0 ? "+" : ""}
                                    {Math.round(diff * 10) / 10}%
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
                        {comparisonData?.locations.map((metric, index) => {
                          const baseline =
                            comparisonData?.locations[0]?.metrics.pickup
                              .averageHours || 0;
                          const diff =
                            index > 0
                              ? calculatePercentageDifference(
                                  metric.metrics.pickup.averageHours,
                                  baseline,
                                )
                              : 0;

                          return (
                            <div
                              key={metric.location.id}
                              className="rounded-lg bg-muted/50 p-3 text-center"
                            >
                              <div className="text-sm font-semibold text-muted-foreground">
                                {metric.location.name}
                              </div>
                              <div className="mt-1 text-2xl font-bold">
                                {metric.metrics.pickup.averageHours}h
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
                        {comparisonData?.locations.map((metric, index) => {
                          const baseline =
                            comparisonData?.locations[0]?.metrics.revenue
                              .totalRevenue || 0;
                          const diff =
                            index > 0
                              ? calculatePercentageDifference(
                                  metric.metrics.revenue.totalRevenue,
                                  baseline,
                                )
                              : 0;

                          return (
                            <div
                              key={metric.location.id}
                              className="rounded-lg bg-muted/50 p-3 text-center"
                            >
                              <div className="text-sm font-semibold text-muted-foreground">
                                {metric.location.name}
                              </div>
                              <div className="mt-1 text-2xl font-bold">
                                $
                                {metric.metrics.revenue.totalRevenue.toLocaleString()}
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
                        {comparisonData?.locations.map((metric, index) => (
                          <Bar
                            key={metric.location.id}
                            dataKey={metric.location.name}
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
