"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  Clock,
  MapPin,
  Package,
  TrendingUp,
  User,
} from "lucide-react";

import { Badge } from "@ebox/ui/badge";
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
import { Skeleton } from "@ebox/ui/skeleton";

import { api } from "../../../trpc/react";

const activityTypeIcons = {
  delivery: Package,
  pickup: Package,
  processing: Clock,
  alert: AlertCircle,
};

const activityTypeColors = {
  delivery: "text-blue-600",
  pickup: "text-green-600",
  processing: "text-orange-600",
  alert: "text-red-600",
};

const statusColors = {
  completed: "bg-green-100 text-green-800",
  ready: "bg-blue-100 text-blue-800",
  warning: "bg-red-100 text-red-800",
  processing: "bg-orange-100 text-orange-800",
};

const priorityColors = {
  normal: "border-l-blue-300",
  medium: "border-l-orange-300",
  high: "border-l-red-300",
};

interface EnhancedRecentActivityProps {
  locationId?: number;
  className?: string;
}

export function EnhancedRecentActivity({
  locationId,
  className,
}: EnhancedRecentActivityProps) {
  const [filterType, setFilterType] = useState<string>("all");
  const [filterLocation, setFilterLocation] = useState<string>("all");

  // TODO: Add Redis caching for performance optimization
  const {
    data: activities,
    isLoading,
    error,
    refetch,
  } = api.analytics.getRecentActivity.useQuery({
    locationId,
    limit: 20,
    activityTypes:
      filterType === "all"
        ? undefined
        : [filterType as "delivery" | "pickup" | "processing" | "alert"],
  });

  // Get locations for filter dropdown
  const { data: locations } = api.analytics.getLocations.useQuery();

  const filteredActivities =
    activities?.filter((activity) => {
      const locationMatch =
        filterLocation === "all" || activity.location === filterLocation;
      return locationMatch;
    }) || [];

  // Get unique locations from activities for filter
  const activityLocations = [
    ...new Set(activities?.map((a) => a.location) || []),
  ];

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest activities across all locations with filtering
              </CardDescription>
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-start space-x-3 rounded-lg border-l-4 bg-muted/20 p-3"
              >
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-3 w-48" />
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest activities across all locations with filtering
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            <div className="text-center">
              <AlertCircle className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p>Failed to load recent activity</p>
              <p className="text-sm">Please try again later</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest activities across all locations with filtering
            </CardDescription>
          </div>
          <Badge variant="outline">
            {filteredActivities.length} activities
          </Badge>
        </div>

        {/* Filters */}
        <div className="flex gap-2 pt-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="delivery">Deliveries</SelectItem>
              <SelectItem value="pickup">Pickups</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="alert">Alerts</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterLocation} onValueChange={setFilterLocation}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {activityLocations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 space-y-3 overflow-y-auto">
          {filteredActivities.map((activity) => {
            const Icon =
              activityTypeIcons[
                activity.type as keyof typeof activityTypeIcons
              ];

            return (
              <div
                key={activity.id}
                className={`flex items-start space-x-3 rounded-lg border-l-4 bg-muted/20 p-3 ${priorityColors[activity.priority as keyof typeof priorityColors]}`}
              >
                <div
                  className={`rounded-full bg-background p-2 ${activityTypeColors[activity.type as keyof typeof activityTypeColors]}`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">
                      {activity.title}
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-xs ${statusColors[activity.status as keyof typeof statusColors]}`}
                    >
                      {activity.status}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {activity.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{activity.location}</span>
                    </div>

                    {activity.customerId && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{activity.customerId}</span>
                      </div>
                    )}

                    {activity.packageCount && (
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        <span>
                          {activity.packageCount} pkg
                          {activity.packageCount > 1 ? "s" : ""}
                        </span>
                      </div>
                    )}

                    {activity.revenue && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>${activity.revenue.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.timestamp), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            );
          })}

          {filteredActivities.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              <AlertCircle className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p>No activities match the current filters</p>
              <Button
                variant="link"
                size="sm"
                onClick={() => {
                  setFilterType("all");
                  setFilterLocation("all");
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>

        {filteredActivities.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <Button variant="outline" size="sm" className="w-full">
              View All Activity
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
