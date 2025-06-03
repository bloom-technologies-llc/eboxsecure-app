"use client";

import { format, subDays } from "date-fns";
import {
  Legend,
  Line,
  LineChart,
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

// Generate mock trend data that resembles real analytics data structure
function generateMockTrendData(days: number) {
  return Array.from({ length: days }, (_, i) => {
    const date = subDays(new Date(), days - 1 - i);
    const baseUtilization = 65 + Math.sin(i * 0.1) * 10; // Create wave pattern
    const noise = (Math.random() - 0.5) * 8; // Add some randomness

    return {
      date: format(date, "MMM dd"),
      fullDate: date,
      currentUtilization: Math.max(20, Math.min(95, baseUtilization + noise)),
      avgDailyUtilization: Math.max(
        15,
        Math.min(90, baseUtilization + noise - 5),
      ),
      packages: Math.floor(200 + Math.random() * 300),
    };
  });
}

const mockTrendData = generateMockTrendData(30);

interface UtilizationTrendsChartProps {
  className?: string;
}

export function UtilizationTrendsChart({
  className,
}: UtilizationTrendsChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Utilization Trends</CardTitle>
        <CardDescription>
          Current vs. average daily utilization over the last 30 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={mockTrendData}>
            <XAxis
              dataKey="date"
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
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Date
                          </span>
                          <span className="font-bold text-muted-foreground">
                            {label}
                          </span>
                        </div>
                        {payload.map((entry, index) => (
                          <div key={index} className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              {entry.name}
                            </span>
                            <span
                              className="font-bold"
                              style={{ color: entry.color }}
                            >
                              {entry.value}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="currentUtilization"
              stroke="#8884d8"
              strokeWidth={2}
              name="Current Utilization"
              dot={{ fill: "#8884d8", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#8884d8", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="avgDailyUtilization"
              stroke="#82ca9d"
              strokeWidth={2}
              name="Avg Daily Utilization"
              dot={{ fill: "#82ca9d", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#82ca9d", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
