"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";

import type { RouterOutputs } from "@ebox/admin-api";
import { Button } from "@ebox/ui/button";
import { Checkbox } from "@ebox/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@ebox/ui/form";
import { useToast } from "@ebox/ui/hooks/use-toast";
import { Input } from "@ebox/ui/input";

import { api } from "~/trpc/react";

const dayHourSchema = z
  .object({
    dayOfWeek: z.number().min(0).max(6),
    openTime: z.string().nullable(),
    closeTime: z.string().nullable(),
    isOpen: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.isOpen && data.openTime && data.closeTime) {
        return data.openTime < data.closeTime;
      }
      return true;
    },
    {
      message: "Close time must be after open time",
      path: ["closeTime"],
    },
  );

const hoursSchema = z.object({
  hours: z.array(dayHourSchema),
});

type LocationData = RouterOutputs["locations"]["getLocationDetails"];

interface LocationHoursEditFormProps {
  locationId: number;
  currentHours: LocationData["hours"];
  onSuccess?: () => void;
  onCancel?: () => void;
}

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function LocationHoursEditForm({
  locationId,
  currentHours,
  onSuccess,
  onCancel,
}: LocationHoursEditFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const utils = api.useUtils();

  // Create a map of current hours by day
  const hoursMap = new Map();
  currentHours.forEach((hour) => {
    hoursMap.set(hour.dayOfWeek, hour);
  });

  // Initialize form with current hours data
  const initialHours = dayNames.map((_, index) => {
    const dayHour = hoursMap.get(index);
    return {
      dayOfWeek: index,
      openTime: dayHour?.openTime || "09:00",
      closeTime: dayHour?.closeTime || "17:00",
      isOpen: dayHour?.isOpen || false,
    };
  });

  const form = useForm<z.infer<typeof hoursSchema>>({
    resolver: zodResolver(hoursSchema),
    defaultValues: {
      hours: initialHours,
    },
  });

  const { fields, update } = useFieldArray({
    control: form.control,
    name: "hours",
  });

  const { mutate: updateHours, isPending } =
    api.locations.updateLocationHours.useMutation({
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Store hours updated successfully",
        });
        utils.locations.getLocationDetails.invalidate({ locationId });
        utils.locations.getAllLocations.invalidate();
        router.refresh();
        onSuccess?.();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });

  const onSubmit = (values: z.infer<typeof hoursSchema>) => {
    updateHours({
      locationId,
      hours: values.hours,
    });
  };

  const toggleDayOpen = (dayIndex: number, isOpen: boolean) => {
    const currentDay = form.getValues(`hours.${dayIndex}`);
    update(dayIndex, {
      ...currentDay,
      isOpen,
      openTime: isOpen ? currentDay.openTime : null,
      closeTime: isOpen ? currentDay.closeTime : null,
    });
  };

  const setBusinessHours = () => {
    // Monday-Friday 9 AM - 5 PM, weekends closed
    const businessHours = dayNames.map((_, index) => ({
      dayOfWeek: index,
      openTime: index >= 1 && index <= 5 ? "09:00" : null,
      closeTime: index >= 1 && index <= 5 ? "17:00" : null,
      isOpen: index >= 1 && index <= 5,
    }));

    form.setValue("hours", businessHours);
  };

  const setRetailHours = () => {
    // Monday-Saturday 10 AM - 8 PM, Sunday 12 PM - 6 PM
    const retailHours = dayNames.map((_, index) => ({
      dayOfWeek: index,
      openTime: index === 0 ? "12:00" : "10:00",
      closeTime: index === 0 ? "18:00" : "20:00",
      isOpen: true,
    }));

    form.setValue("hours", retailHours);
  };

  const closeAllDays = () => {
    const closedHours = dayNames.map((_, index) => ({
      dayOfWeek: index,
      openTime: null,
      closeTime: null,
      isOpen: false,
    }));

    form.setValue("hours", closedHours);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 rounded-lg bg-gray-50 p-2">
          <p className="mb-1 w-full text-xs font-medium">Quick Actions:</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={setBusinessHours}
            className="h-7 text-xs"
          >
            Business Hours (M-F 9-5)
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={setRetailHours}
            className="h-7 text-xs"
          >
            Retail Hours (M-Sa 10-8, Su 12-6)
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={closeAllDays}
            className="h-7 text-xs"
          >
            Close All Days
          </Button>
        </div>

        <div className="space-y-2">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex flex-col gap-2 rounded-lg border p-2 sm:flex-row sm:items-center"
            >
              <div className="w-full text-xs font-medium sm:w-16">
                {dayNames[index]}
              </div>

              <FormField
                control={form.control}
                name={`hours.${index}.isOpen`}
                render={({ field: checkboxField }) => (
                  <FormItem className="flex items-center space-x-1 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={checkboxField.value}
                        onCheckedChange={(checked) => {
                          checkboxField.onChange(checked);
                          toggleDayOpen(index, !!checked);
                        }}
                      />
                    </FormControl>
                    <FormLabel className="text-xs">Open</FormLabel>
                  </FormItem>
                )}
              />

              {form.watch(`hours.${index}.isOpen`) ? (
                <div className="flex flex-1 flex-col gap-1 sm:flex-row">
                  <FormField
                    control={form.control}
                    name={`hours.${index}.openTime`}
                    render={({ field: timeField }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-xs">Open</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            className="h-8 w-full text-xs"
                            {...timeField}
                            value={timeField.value || "09:00"}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`hours.${index}.closeTime`}
                    render={({ field: timeField }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-xs">Close</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            className="h-8 w-full text-xs"
                            {...timeField}
                            value={timeField.value || "17:00"}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ) : (
                <div className="flex-1 text-right text-xs text-muted-foreground">
                  Closed
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              size="sm"
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isPending} size="sm">
            {isPending ? "Updating..." : "Update Hours"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
