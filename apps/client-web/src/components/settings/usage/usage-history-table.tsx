"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import {
  AlertTriangle,
  Calendar,
  Clock,
  Package,
  Search,
  X,
} from "lucide-react";

import { Badge } from "@ebox/ui/badge";
import { Button } from "@ebox/ui/button";
import { Card, CardContent } from "@ebox/ui/card";
import { Input } from "@ebox/ui/input";
import { Label } from "@ebox/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ebox/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ebox/ui/table";

interface QueryParams {
  startDate?: Date;
  endDate?: Date;
  eventType?: "PACKAGE_HOLDING" | "PACKAGE_ALLOWANCE";
}

export function UsageHistoryTable() {
  // Form state (doesn't trigger queries)
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [eventType, setEventType] = useState<string>("");

  // Query parameters state (triggers queries)
  const [queryParams, setQueryParams] = useState<QueryParams>({});
  const [hasSearched, setHasSearched] = useState(true);

  const {
    data: events,
    isLoading,
    error,
  } = api.meter.getUsageHistory.useQuery(queryParams, {
    enabled: hasSearched,
  });

  const handleSearch = () => {
    setQueryParams({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      eventType:
        eventType === "all" || eventType === ""
          ? undefined
          : (eventType as "PACKAGE_HOLDING" | "PACKAGE_ALLOWANCE"),
    });
    setHasSearched(true);
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setEventType("");
    setQueryParams({});
    setHasSearched(false);
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "PACKAGE_HOLDING":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "PACKAGE_ALLOWANCE":
        return <Package className="h-4 w-4 text-purple-600" />;
      default:
        return null;
    }
  };

  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case "PACKAGE_HOLDING":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Holding
          </Badge>
        );
      case "PACKAGE_ALLOWANCE":
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            Allowance
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="h-8 w-24 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-4 w-4" />
          <span>Failed to load usage history</span>
        </div>
      </div>
    );
  }

  const hasFilters = startDate || endDate || eventType;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-type">Event Type</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger>
                  <SelectValue placeholder="All events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="PACKAGE_HOLDING">
                    Package Holding
                  </SelectItem>
                  <SelectItem value="PACKAGE_ALLOWANCE">
                    Package Allowance
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleSearch}
                className="flex-1"
              >
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
              {hasFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="flex-1"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Event Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events && events.length > 0 ? (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {formatDate(event.createdAt)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(event.createdAt)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getEventTypeIcon(event.eventType)}
                      {getEventTypeBadge(event.eventType)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {event.value}{" "}
                      {event.eventType === "PACKAGE_HOLDING"
                        ? "days"
                        : "packages"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {event.order ? (
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          #{event.order.id}
                        </div>
                        {event.order.vendorOrderId && (
                          <div className="text-xs text-gray-500">
                            Vendor: {event.order.vendorOrderId}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {event.order?.shippedLocation ? (
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {event.order.shippedLocation.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {event.order.shippedLocation.address}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Package className="h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-500">
                      {hasFilters
                        ? "No usage events found for the selected filters"
                        : "No usage events found"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      {events && events.length > 0 && (
        <div className="flex items-center justify-between border-t pt-4 text-sm text-gray-500">
          <span>
            Showing {events.length} events
            {hasFilters && " (filtered)"}
          </span>
          <div className="flex items-center gap-4">
            <span>
              {events.filter((e) => e.eventType === "PACKAGE_HOLDING").length}{" "}
              holding events
            </span>
            <span>
              {events.filter((e) => e.eventType === "PACKAGE_ALLOWANCE").length}{" "}
              allowance events
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
