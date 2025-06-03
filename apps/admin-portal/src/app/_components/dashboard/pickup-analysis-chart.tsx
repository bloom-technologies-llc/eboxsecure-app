"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
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

// Mock pickup distribution data
const mockPickupData = [
  { timeRange: "Same Day", count: 145, percentage: 42.3, avgHours: 8.5 },
  { timeRange: "1-2 Days", count: 98, percentage: 28.6, avgHours: 36.2 },
  { timeRange: "3-5 Days", count: 67, percentage: 19.5, avgHours: 84.1 },
  { timeRange: "6+ Days", count: 33, percentage: 9.6, avgHours: 168.3 },
];

interface PickupAnalysisChartProps {
  className?: string;
}

export function PickupAnalysisChart({ className }: PickupAnalysisChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Pickup Rate Analysis</CardTitle>
        <CardDescription>
          Package pickup time distribution and average pickup times
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={mockPickupData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timeRange"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="left"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}h`}
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
                              Package Count
                            </div>
                            <div className="font-bold text-blue-600">
                              {data?.count} packages
                            </div>
                          </div>
                          <div>
                            <div className="text-[0.70rem] uppercase text-muted-foreground">
                              Percentage
                            </div>
                            <div className="font-bold text-green-600">
                              {data?.percentage}%
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-[0.70rem] uppercase text-muted-foreground">
                              Average Hours
                            </div>
                            <div className="font-bold text-orange-600">
                              {data?.avgHours}h
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
              yAxisId="left"
              dataKey="count"
              fill="#8884d8"
              name="Package Count"
              radius={[4, 4, 0, 0]}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="avgHours"
              stroke="#ff7300"
              strokeWidth={3}
              name="Avg Hours"
              dot={{ fill: "#ff7300", strokeWidth: 2, r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Summary stats */}
        <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
          {mockPickupData.map((item, index) => (
            <div key={index} className="text-center">
              <div className="font-semibold text-muted-foreground">
                {item.timeRange}
              </div>
              <div className="text-lg font-bold">{item.percentage}%</div>
              <div className="text-xs text-muted-foreground">
                {item.count} packages
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
