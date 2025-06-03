"use client";

import { useMemo, useState } from "react";
import { subDays } from "date-fns";
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
import { RevenuePerformanceChart } from "../_components/dashboard/revenue-performance-chart";
import { UtilizationTrendsChart } from "../_components/dashboard/utilization-trends-chart";
import { api } from "../../trpc/react";

export default function Page() {
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30), // Default to last 30 days
    to: new Date(),
  });
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // Fetch locations for the dropdown
  const {
    data: locations,
    isLoading: isLoadingLocations,
    error: locationsError,
  } = api.analytics.getLocations.useQuery();

  // Calculate derived values
  const selectedLocationId = useMemo(() => {
    if (selectedLocation === "all") return undefined;
    return parseInt(selectedLocation);
  }, [selectedLocation]);

  // Ensure we always have valid dates for the API
  const effectiveDateRange = useMemo(() => {
    const from = dateRange?.from || subDays(new Date(), 30);
    const to = dateRange?.to || new Date();

    // Ensure both dates are valid
    return {
      from: from instanceof Date ? from : subDays(new Date(), 30),
      to: to instanceof Date ? to : new Date(),
    };
  }, [dateRange]);

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    console.log("Date range changed:", range);
  };

  const handleExport = (format: "csv" | "pdf") => {
    console.log(
      `Exporting analytics data for ${selectedLocation} as ${format.toUpperCase()}`,
    );
    // TODO: Implement actual export when analytics.exportAnalyticsData is working
  };

  const handleCompareLocations = () => {
    setShowComparisonModal(true);
  };

  // Loading state for locations
  if (isLoadingLocations) {
    return (
      <div className="mt-16 flex-1 space-y-8 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Analytics Dashboard
          </h2>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  // Error state for locations
  if (locationsError) {
    return (
      <div className="mt-16 flex-1 space-y-8 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Analytics Dashboard
          </h2>
          <div className="text-sm text-red-600">
            Error loading locations: {locationsError.message}
          </div>
        </div>
      </div>
    );
  }

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
              {locations?.map((location: { id: number; name: string }) => (
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
          <ExportControls
            locationId={selectedLocationId}
            dateRange={effectiveDateRange}
            onExport={handleExport}
          />
        </div>
      </div>

      {/* Enhanced Key Metrics Cards with real data */}
      <EnhancedMetricsCards
        locationId={selectedLocationId}
        dateRange={effectiveDateRange}
      />

      {/* Primary Analytics Section (2x2 grid) */}
      <div className="grid gap-4 md:grid-cols-2">
        <UtilizationTrendsChart
          locationId={selectedLocationId}
          dateRange={effectiveDateRange}
        />
        <PickupAnalysisChart
          locationId={selectedLocationId}
          dateRange={effectiveDateRange}
        />
        <CustomerUsageChart
          locationId={selectedLocationId}
          dateRange={effectiveDateRange}
        />
        <RevenuePerformanceChart
          locationId={selectedLocationId}
          dateRange={effectiveDateRange}
        />
      </div>

      {/* Operational Insights Section (2x1 grid) */}
      <div className="grid gap-4 md:grid-cols-2">
        <LocationPerformance />
        <PeakCapacityHeatmap />
      </div>

      {/* Bottom Section - Enhanced Activity and Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <EnhancedRecentActivity locationId={selectedLocationId} />

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
