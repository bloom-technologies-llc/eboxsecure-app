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
import { AddressFields, addressSchemaFields } from "./address-fields";

const editLocationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  ...addressSchemaFields,
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  storageCapacity: z.number().min(1, "Storage capacity must be at least 1"),
  locationType: z.nativeEnum(LocationType),
});

interface LocationEditFormProps {
  locationId: number;
  initialData: {
    name: string;
    address1: string;
    address2?: string | null;
    city: string;
    state: string;
    zip: string;
    countryCode: string;
    email?: string | null;
    storageCapacity: number;
    locationType: LocationType;
  };
  // Legacy flat address on file. Shown as a reference for rows that predate the
  // structured fields so they can be re-entered (migrated) accurately.
  legacyAddress?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function LocationEditForm({
  locationId,
  initialData,
  legacyAddress,
  onSuccess,
  onCancel,
}: LocationEditFormProps) {
  // A row that predates the structured fields has no address1 yet.
  const needsMigration = !initialData.address1;
  const router = useRouter();
  const { toast } = useToast();
  const utils = api.useUtils();

  const form = useForm<z.infer<typeof editLocationSchema>>({
    resolver: zodResolver(editLocationSchema),
    defaultValues: {
      name: initialData.name,
      address1: initialData.address1,
      address2: initialData.address2 || "",
      city: initialData.city,
      state: initialData.state,
      zip: initialData.zip,
      countryCode: initialData.countryCode || "US",
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
      address2: values.address2 || undefined,
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

        {needsMigration && legacyAddress && (
          <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <span className="font-medium">Address on file:</span> {legacyAddress}
            <p className="mt-1 text-xs text-amber-700">
              Re-enter the fields below to split this into street/city/state/ZIP
              (required for Shopify checkout autofill).
            </p>
          </div>
        )}

        <AddressFields control={form.control} />

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
