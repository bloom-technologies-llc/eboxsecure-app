"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { EmployeeRole } from "@prisma/client";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@ebox/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@ebox/ui/form";
import { useToast } from "@ebox/ui/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ebox/ui/select";

import { api } from "~/trpc/react";

const editEmployeeSchema = z.object({
  role: z.nativeEnum(EmployeeRole),
  locationId: z.number(),
});

interface EmployeeEditFormProps {
  employeeId: string;
  initialData: {
    role: EmployeeRole;
    locationId: number;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EmployeeEditForm({
  employeeId,
  initialData,
  onSuccess,
  onCancel,
}: EmployeeEditFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const utils = api.useUtils();

  // Get all locations for the dropdown
  const { data: locations } = api.employees.getAllLocations.useQuery();

  const form = useForm<z.infer<typeof editEmployeeSchema>>({
    resolver: zodResolver(editEmployeeSchema),
    defaultValues: {
      role: initialData.role,
      locationId: initialData.locationId,
    },
  });

  const { mutate: updateRole, isPending: isUpdatingRole } =
    api.employees.updateEmployeeRole.useMutation({
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Employee role updated successfully",
        });
        utils.employees.getEmployeeDetails.invalidate({ employeeId });
        utils.employees.getAllEmployees.invalidate();
        router.refresh();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });

  const { mutate: updateLocation, isPending: isUpdatingLocation } =
    api.employees.updateEmployeeLocation.useMutation({
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Employee location updated successfully",
        });
        utils.employees.getEmployeeDetails.invalidate({ employeeId });
        utils.employees.getAllEmployees.invalidate();
        router.refresh();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });

  const onSubmit = (values: z.infer<typeof editEmployeeSchema>) => {
    const promises = [];

    // Update role if it changed
    if (values.role !== initialData.role) {
      promises.push(
        new Promise<void>((resolve, reject) => {
          updateRole(
            { employeeId, role: values.role },
            {
              onSuccess: () => resolve(),
              onError: (error) => reject(error),
            },
          );
        }),
      );
    }

    // Update location if it changed
    if (values.locationId !== initialData.locationId) {
      promises.push(
        new Promise<void>((resolve, reject) => {
          updateLocation(
            { employeeId, locationId: values.locationId },
            {
              onSuccess: () => resolve(),
              onError: (error) => reject(error),
            },
          );
        }),
      );
    }

    if (promises.length === 0) {
      // No changes
      onSuccess?.();
      return;
    }

    Promise.all(promises)
      .then(() => {
        onSuccess?.();
      })
      .catch(() => {
        // Error handling is done in individual mutations
      });
  };

  const isPending = isUpdatingRole || isUpdatingLocation;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={EmployeeRole.MANAGER}>Manager</SelectItem>
                  <SelectItem value={EmployeeRole.ASSOCIATE}>
                    Associate
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="locationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                defaultValue={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {locations?.map((location) => (
                    <SelectItem
                      key={location.id}
                      value={location.id.toString()}
                    >
                      {location.name} ({location.locationType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending ? "Updating..." : "Update Employee"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
