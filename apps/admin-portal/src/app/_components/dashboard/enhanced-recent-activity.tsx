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

// Mock activity data with more detailed information
const mockActivities = [
  {
    id: 1,
    type: "delivery",
    title: "Package Delivered",
    description: "Order #12847 delivered to Location A",
    location: "Location A",
    customer: "John Doe",
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    status: "completed",
    priority: "normal",
    packageCount: 1,
    revenue: 24.99,
  },
  {
    id: 2,
    type: "pickup",
    title: "Package Picked Up",
    description: "Customer retrieved Order #12832",
    location: "Location C",
    customer: "Sarah Wilson",
    timestamp: new Date(Date.now() - 1000 * 60 * 32), // 32 minutes ago
    status: "completed",
    priority: "normal",
    packageCount: 2,
    revenue: 45.98,
  },
  {
    id: 3,
    type: "alert",
    title: "High Utilization Alert",
    description: "Location C approaching capacity limit",
    location: "Location C",
    customer: null,
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
    status: "warning",
    priority: "high",
    packageCount: null,
    revenue: null,
  },
  {
    id: 4,
    type: "delivery",
    title: "Bulk Delivery",
    description: "5 packages delivered to Location B",
    location: "Location B",
    customer: "Multiple",
    timestamp: new Date(Date.now() - 1000 * 60 * 67), // 1 hour 7 minutes ago
    status: "completed",
    priority: "normal",
    packageCount: 5,
    revenue: 124.95,
  },
  {
    id: 5,
    type: "processing",
    title: "Package Processing",
    description: "Order #12841 ready for pickup",
    location: "Location A",
    customer: "Mike Johnson",
    timestamp: new Date(Date.now() - 1000 * 60 * 89), // 1 hour 29 minutes ago
    status: "ready",
    priority: "normal",
    packageCount: 1,
    revenue: 18.99,
  },
  {
    id: 6,
    type: "pickup",
    title: "Package Picked Up",
    description: "Customer retrieved Order #12825",
    location: "Location D",
    customer: "Emma Davis",
    timestamp: new Date(Date.now() - 1000 * 60 * 112), // 1 hour 52 minutes ago
    status: "completed",
    priority: "normal",
    packageCount: 1,
    revenue: 32.5,
  },
  {
    id: 7,
    type: "alert",
    title: "Delayed Pickup Alert",
    description: "Package in Location E for >48 hours",
    location: "Location E",
    customer: "Robert Brown",
    timestamp: new Date(Date.now() - 1000 * 60 * 134), // 2 hours 14 minutes ago
    status: "warning",
    priority: "medium",
    packageCount: 1,
    revenue: null,
  },
  {
    id: 8,
    type: "delivery",
    title: "Package Delivered",
    description: "Order #12816 delivered to Location B",
    location: "Location B",
    customer: "Lisa Garcia",
    timestamp: new Date(Date.now() - 1000 * 60 * 156), // 2 hours 36 minutes ago
    status: "completed",
    priority: "normal",
    packageCount: 1,
    revenue: 19.99,
  },
];

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
  low: "border-l-gray-300",
  normal: "border-l-blue-300",
  medium: "border-l-orange-300",
  high: "border-l-red-300",
};

interface EnhancedRecentActivityProps {
  className?: string;
}

export function EnhancedRecentActivity({
  className,
}: EnhancedRecentActivityProps) {
  const [filterType, setFilterType] = useState<string>("all");
  const [filterLocation, setFilterLocation] = useState<string>("all");

  const filteredActivities = mockActivities.filter((activity) => {
    const typeMatch = filterType === "all" || activity.type === filterType;
    const locationMatch =
      filterLocation === "all" || activity.location === filterLocation;
    return typeMatch && locationMatch;
  });

  const locations = [...new Set(mockActivities.map((a) => a.location))];

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
              {locations.map((location) => (
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

                    {activity.customer && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{activity.customer}</span>
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
                        <span>${activity.revenue}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(activity.timestamp, {
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
