"use client";

import { format, subDays } from "date-fns";
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

// Generate mock customer usage data
function generateMockCustomerData() {
  return Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    const baseCustomers = 15 + Math.sin(i * 0.2) * 5;
    const newCustomers = Math.max(
      0,
      Math.floor(baseCustomers * 0.3 + Math.random() * 3),
    );
    const returningCustomers = Math.floor(
      baseCustomers * 0.7 + Math.random() * 5,
    );

    return {
      date: format(date, "MMM dd"),
      fullDate: date,
      newCustomers,
      returningCustomers,
      totalCustomers: newCustomers + returningCustomers,
    };
  });
}

const mockCustomerData = generateMockCustomerData();

// Weekly summary data
const weeklyData = [
  {
    week: "Week 1",
    newCustomers: 28,
    returningCustomers: 85,
    avgPackagesPerCustomer: 2.3,
  },
  {
    week: "Week 2",
    newCustomers: 31,
    returningCustomers: 92,
    avgPackagesPerCustomer: 2.1,
  },
  {
    week: "Week 3",
    newCustomers: 24,
    returningCustomers: 88,
    avgPackagesPerCustomer: 2.4,
  },
  {
    week: "Week 4",
    newCustomers: 35,
    returningCustomers: 96,
    avgPackagesPerCustomer: 2.2,
  },
];

interface CustomerUsageChartProps {
  className?: string;
}

export function CustomerUsageChart({ className }: CustomerUsageChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Customer Usage Patterns</CardTitle>
        <CardDescription>
          New vs. returning customers over the last 30 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={mockCustomerData}>
            <XAxis
              dataKey="date"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
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
                  const data = payload[0]?.payload;
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
                              {data?.newCustomers}
                            </div>
                          </div>
                          <div>
                            <div className="text-[0.70rem] uppercase text-muted-foreground">
                              Returning
                            </div>
                            <div className="font-bold text-blue-600">
                              {data?.returningCustomers}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-[0.70rem] uppercase text-muted-foreground">
                              Total Customers
                            </div>
                            <div className="font-bold">
                              {data?.totalCustomers}
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
              stackId="customers"
              fill="#10b981"
              name="New Customers"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="returningCustomers"
              stackId="customers"
              fill="#3b82f6"
              name="Returning Customers"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Weekly Summary */}
        <div className="mt-6">
          <h4 className="mb-3 text-sm font-semibold">Weekly Summary</h4>
          <div className="grid grid-cols-4 gap-4">
            {weeklyData.map((week, index) => (
              <div
                key={index}
                className="rounded-lg bg-muted/50 p-3 text-center"
              >
                <div className="text-sm font-semibold text-muted-foreground">
                  {week.week}
                </div>
                <div className="mt-1">
                  <div className="text-lg font-bold text-green-600">
                    {week.newCustomers}
                  </div>
                  <div className="text-xs text-muted-foreground">New</div>
                </div>
                <div className="mt-1">
                  <div className="text-lg font-bold text-blue-600">
                    {week.returningCustomers}
                  </div>
                  <div className="text-xs text-muted-foreground">Returning</div>
                </div>
                <div className="mt-2 border-t pt-2">
                  <div className="text-sm font-semibold">
                    {week.avgPackagesPerCustomer}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Avg packages
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
