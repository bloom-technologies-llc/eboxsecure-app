"use client";

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

// Mock revenue data per location
const mockRevenueData = [
  {
    location: "Location A",
    revenue: 12450,
    packages: 342,
    revenuePerPackage: 36.4,
    growth: 12.3,
  },
  {
    location: "Location B",
    revenue: 9875,
    packages: 287,
    revenuePerPackage: 34.41,
    growth: 8.7,
  },
  {
    location: "Location C",
    revenue: 15230,
    packages: 429,
    revenuePerPackage: 35.5,
    growth: 15.2,
  },
  {
    location: "Location D",
    revenue: 7650,
    packages: 198,
    revenuePerPackage: 38.64,
    growth: -3.1,
  },
  {
    location: "Location E",
    revenue: 11320,
    packages: 315,
    revenuePerPackage: 35.94,
    growth: 6.8,
  },
];

// Monthly revenue trend
const monthlyTrend = [
  { month: "Jan", revenue: 45200 },
  { month: "Feb", revenue: 48100 },
  { month: "Mar", revenue: 52300 },
  { month: "Apr", revenue: 49800 },
  { month: "May", revenue: 56200 },
  { month: "Jun", revenue: 54700 },
];

interface RevenuePerformanceChartProps {
  className?: string;
}

export function RevenuePerformanceChart({
  className,
}: RevenuePerformanceChartProps) {
  const totalRevenue = mockRevenueData.reduce(
    (sum, item) => sum + item.revenue,
    0,
  );
  const totalPackages = mockRevenueData.reduce(
    (sum, item) => sum + item.packages,
    0,
  );
  const avgRevenuePerPackage = totalRevenue / totalPackages;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Revenue Performance</CardTitle>
        <CardDescription>
          Revenue breakdown by location and monthly trends
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Revenue by Location */}
          <div>
            <h4 className="mb-3 text-sm font-semibold">Revenue by Location</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={mockRevenueData}>
                <XAxis
                  dataKey="location"
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
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0]?.payload;
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-sm">
                          <div className="grid gap-2">
                            <div className="font-semibold">{label}</div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-[0.70rem] uppercase text-muted-foreground">
                                  Total Revenue
                                </div>
                                <div className="font-bold text-green-600">
                                  ${data?.revenue?.toLocaleString()}
                                </div>
                              </div>
                              <div>
                                <div className="text-[0.70rem] uppercase text-muted-foreground">
                                  Packages
                                </div>
                                <div className="font-bold text-blue-600">
                                  {data?.packages}
                                </div>
                              </div>
                              <div>
                                <div className="text-[0.70rem] uppercase text-muted-foreground">
                                  Per Package
                                </div>
                                <div className="font-bold text-purple-600">
                                  ${data?.revenuePerPackage?.toFixed(2)}
                                </div>
                              </div>
                              <div>
                                <div className="text-[0.70rem] uppercase text-muted-foreground">
                                  Growth
                                </div>
                                <div
                                  className={`font-bold ${data?.growth >= 0 ? "text-green-600" : "text-red-600"}`}
                                >
                                  {data?.growth > 0 ? "+" : ""}
                                  {data?.growth}%
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
                <Bar
                  dataKey="revenue"
                  fill="#8884d8"
                  name="Revenue"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Trend */}
          <div>
            <h4 className="mb-3 text-sm font-semibold">
              Monthly Revenue Trend
            </h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyTrend}>
                <XAxis
                  dataKey="month"
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
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value) => [
                    `$${value.toLocaleString()}`,
                    "Revenue",
                  ]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Bar dataKey="revenue" fill="#82ca9d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 border-t pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${totalRevenue.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {totalPackages.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Packages
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                ${avgRevenuePerPackage.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">
                Avg per Package
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
