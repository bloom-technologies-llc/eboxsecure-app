"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { DateRange } from "react-day-picker";

import { Button } from "@ebox/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ebox/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ebox/ui/select";

import { CustomerUsageChart } from "../_components/dashboard/customer-usage-chart";
import { CalendarDateRangePicker } from "../_components/dashboard/date-range-picker";
import { EnhancedMetricsCards } from "../_components/dashboard/enhanced-metrics-cards";
import { ExportControls } from "../_components/dashboard/export-controls";
import { LocationPerformance } from "../_components/dashboard/location-performance";
import { Overview } from "../_components/dashboard/overview";
import { PickupAnalysisChart } from "../_components/dashboard/pickup-analysis-chart";
import { RecentActivity } from "../_components/dashboard/recent-activity";
import { RevenuePerformanceChart } from "../_components/dashboard/revenue-performance-chart";
import { UtilizationTrendsChart } from "../_components/dashboard/utilization-trends-chart";

// Mock location data that matches the expected Prisma structure
const mockLocations = [
  { id: 1, name: "Location A", storageCapacity: 500 },
  { id: 2, name: "Location B", storageCapacity: 350 },
  { id: 3, name: "Location C", storageCapacity: 750 },
  { id: 4, name: "Location D", storageCapacity: 400 },
  { id: 5, name: "Location E", storageCapacity: 600 },
];

export default function Page() {
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    console.log("Date range changed:", range);
  };

  const handleExport = (format: "csv" | "pdf") => {
    console.log(
      `Exporting analytics data for ${selectedLocation} as ${format.toUpperCase()}`,
    );
  };

  const handleCompareLocations = () => {
    // Placeholder for Phase 2 implementation
    alert(
      "Multi-location comparison will be available in Phase 2 of the implementation",
    );
  };

  return (
    <div className="mt-16 flex-1 space-y-8 p-8 pt-6">
      {/* Header with enhanced controls */}
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Analytics Dashboard
        </h2>
        <div className="flex items-center space-x-2">
          <CalendarDateRangePicker onDateRangeChange={handleDateRangeChange} />
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {mockLocations.map((location) => (
                <SelectItem key={location.id} value={location.id.toString()}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleCompareLocations}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Compare Locations
          </Button>
          <ExportControls onExport={handleExport} />
        </div>
      </div>

      {/* Enhanced Key Metrics Cards */}
      <EnhancedMetricsCards />

      {/* Primary Analytics Section (2x2 grid) */}
      <div className="grid gap-4 md:grid-cols-2">
        <UtilizationTrendsChart />
        <PickupAnalysisChart />
        <CustomerUsageChart />
        <RevenuePerformanceChart />
      </div>

      {/* Operational Insights Section (2x1 grid) */}
      <div className="grid gap-4 md:grid-cols-2">
        <LocationPerformance />
        <Card>
          <CardHeader>
            <CardTitle>Processing Efficiency</CardTitle>
            <CardDescription>
              Package processing time trends and bottlenecks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-8 text-center text-muted-foreground">
              <div className="text-lg font-semibold">
                Processing Efficiency Chart
              </div>
              <div className="mt-2 text-sm">
                Peak capacity heatmap will be implemented in Week 2 of Phase 1
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section - Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Recent activities across all locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Annual Revenue Overview</CardTitle>
            <CardDescription>
              Monthly revenue trends for the current year
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
