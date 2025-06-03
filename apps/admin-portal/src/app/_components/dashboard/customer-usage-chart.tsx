"use client";

import { format } from "date-fns";
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ebox/ui/card";
import { Skeleton } from "@ebox/ui/skeleton";

import { api } from "../../../trpc/react";

interface CustomerUsageChartProps {
  locationId?: number;
  dateRange: {
    from: Date;
    to: Date;
  };
  className?: string;
}

export function CustomerUsageChart({
  locationId,
  dateRange,
  className,
}: CustomerUsageChartProps) {
  // TODO: Add Redis caching for performance optimization
  const {
    data: customerData,
    isLoading,
    error,
  } = api.analytics.getCustomerUsageMetrics.useQuery({
    locationId,
    dateRange,
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Customer Usage Patterns</CardTitle>
          <CardDescription>
            Customer analytics for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
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
          <CardTitle>Customer Usage Patterns</CardTitle>
          <CardDescription>
            Customer analytics for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p>Failed to load customer analytics</p>
              <p className="text-sm">Please try again later</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!customerData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Customer Usage Patterns</CardTitle>
          <CardDescription>
            Customer analytics for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p>No customer data available</p>
              <p className="text-sm">Try selecting a different date range</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Create a simple bar chart showing customer metrics
  const chartData = [
    {
      category: "Customer Types",
      newCustomers: customerData.newCustomers,
      returningCustomers: customerData.returningCustomers,
    },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Customer Usage Patterns</CardTitle>
        <CardDescription>
          Customer analytics for the selected period
          {locationId && (
            <span className="block text-sm">Location-specific data</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <XAxis
              dataKey="category"
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
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-sm">
                      <div className="grid gap-2">
                        <div className="font-semibold">{label}</div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-[0.70rem] uppercase text-muted-foreground">
                              New Customers
                            </div>
                            <div className="font-bold text-green-600">
                              {customerData.newCustomers}
                            </div>
                          </div>
                          <div>
                            <div className="text-[0.70rem] uppercase text-muted-foreground">
                              Returning
                            </div>
                            <div className="font-bold text-blue-600">
                              {customerData.returningCustomers}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Bar
              dataKey="newCustomers"
              fill="#10b981"
              name="New Customers"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="returningCustomers"
              fill="#3b82f6"
              name="Returning Customers"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Customer Analytics Summary */}
        <div className="mt-6">
          <h4 className="mb-3 text-sm font-semibold">
            Customer Analytics Summary
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {customerData.uniqueCustomers}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Unique Customers
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(customerData.averagePackagesPerCustomer * 10) / 10}
              </div>
              <div className="text-sm text-muted-foreground">
                Avg Packages per Customer
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {customerData.newCustomers}
              </div>
              <div className="text-sm text-muted-foreground">New Customers</div>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {customerData.totalPackages}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Packages
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
