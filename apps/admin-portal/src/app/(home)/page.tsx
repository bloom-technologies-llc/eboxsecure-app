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
import { EnhancedRecentActivity } from "../_components/dashboard/enhanced-recent-activity";
import { ExportControls } from "../_components/dashboard/export-controls";
import { LocationComparisonModal } from "../_components/dashboard/location-comparison-modal";
import { LocationPerformance } from "../_components/dashboard/location-performance";
import { Overview } from "../_components/dashboard/overview";
import { PeakCapacityHeatmap } from "../_components/dashboard/peak-capacity-heatmap";
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
  const [showComparisonModal, setShowComparisonModal] = useState(false);

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
    setShowComparisonModal(true);
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
        <PeakCapacityHeatmap />
      </div>

      {/* Bottom Section - Enhanced Activity and Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <EnhancedRecentActivity />

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

      {/* Location Comparison Modal */}
      <LocationComparisonModal
        open={showComparisonModal}
        onOpenChange={setShowComparisonModal}
      />
    </div>
  );
}
