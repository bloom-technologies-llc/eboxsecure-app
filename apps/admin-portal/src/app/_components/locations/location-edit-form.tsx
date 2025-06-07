"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { LocationType } from "@prisma/client";
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
import { Input } from "@ebox/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ebox/ui/select";

import { api } from "~/trpc/react";

const editLocationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  storageCapacity: z.number().min(1, "Storage capacity must be at least 1"),
  locationType: z.nativeEnum(LocationType),
});

interface LocationEditFormProps {
  locationId: number;
  initialData: {
    name: string;
    address: string;
    email?: string | null;
    storageCapacity: number;
    locationType: LocationType;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function LocationEditForm({
  locationId,
  initialData,
  onSuccess,
  onCancel,
}: LocationEditFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const utils = api.useUtils();

  const form = useForm<z.infer<typeof editLocationSchema>>({
    resolver: zodResolver(editLocationSchema),
    defaultValues: {
      name: initialData.name,
      address: initialData.address,
      email: initialData.email || "",
      storageCapacity: initialData.storageCapacity,
      locationType: initialData.locationType,
    },
  });

  const { mutate: editLocation, isPending } =
    api.locations.editLocation.useMutation({
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Location updated successfully",
        });
        utils.locations.getAllLocations.invalidate();
        utils.locations.getLocationDetails.invalidate({ locationId });
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

  const onSubmit = (values: z.infer<typeof editLocationSchema>) => {
    editLocation({
      locationId,
      ...values,
      email: values.email || undefined,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter location name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Enter address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="storageCapacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Storage Capacity</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter storage capacity"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="locationType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={LocationType.AGENT}>Agent</SelectItem>
                  <SelectItem value={LocationType.FRANCHISE}>
                    Franchise
                  </SelectItem>
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
            {isPending ? "Updating..." : "Update Location"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
