"use client";

import * as React from "react";
import {
  format,
  startOfQuarter,
  startOfYear,
  subDays,
  subMonths,
} from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@ebox/ui";
import { Button } from "@ebox/ui/button";
import { Calendar } from "@ebox/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@ebox/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ebox/ui/select";

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  onDateRangeChange?: (range: DateRange | undefined) => void;
}

const PREDEFINED_RANGES = [
  {
    label: "Today",
    value: "today",
    getRange: () => ({ from: new Date(), to: new Date() }),
  },
  {
    label: "Last 7 days",
    value: "7d",
    getRange: () => ({ from: subDays(new Date(), 6), to: new Date() }),
  },
  {
    label: "Last 30 days",
    value: "30d",
    getRange: () => ({ from: subDays(new Date(), 29), to: new Date() }),
  },
  {
    label: "Last 90 days",
    value: "90d",
    getRange: () => ({ from: subDays(new Date(), 89), to: new Date() }),
  },
  {
    label: "Current quarter",
    value: "quarter",
    getRange: () => ({ from: startOfQuarter(new Date()), to: new Date() }),
  },
  {
    label: "Last 12 months",
    value: "12m",
    getRange: () => ({ from: subMonths(new Date(), 12), to: new Date() }),
  },
  {
    label: "Year to date",
    value: "ytd",
    getRange: () => ({ from: startOfYear(new Date()), to: new Date() }),
  },
  {
    label: "Custom range",
    value: "custom",
    getRange: () => undefined,
  },
] as const;

export function CalendarDateRangePicker({
  className,
  onDateRangeChange,
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [selectedRange, setSelectedRange] = React.useState("30d");

  const handleRangeSelect = (value: string) => {
    setSelectedRange(value);
    const range = PREDEFINED_RANGES.find((r) => r.value === value);
    if (range && value !== "custom") {
      const newRange = range.getRange();
      setDate(newRange);
      onDateRangeChange?.(newRange);
    }
  };

  const handleDateSelect = (range: DateRange | undefined) => {
    setDate(range);
    setSelectedRange("custom");
    onDateRangeChange?.(range);
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Select value={selectedRange} onValueChange={handleRangeSelect}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PREDEFINED_RANGES.map((range) => (
            <SelectItem key={range.value} value={range.value}>
              {range.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
