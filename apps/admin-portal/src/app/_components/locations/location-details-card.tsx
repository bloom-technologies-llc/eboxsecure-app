"use client";

import { useState } from "react";
import { CircleArrowUp, Pencil } from "lucide-react";

import type { RouterOutputs } from "@ebox/admin-api";
import { Button } from "@ebox/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ebox/ui/dialog";

import { env } from "~/env";
import LocationEditForm from "./location-edit-form";
import LocationHoursEditForm from "./location-hours-edit-form";
import LocationNotesSection from "./location-notes-section";

type LocationData = RouterOutputs["locations"]["getLocationDetails"];

interface LocationDetailsCardProps {
  location: LocationData;
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

export default function LocationDetailsCard({
  location,
}: LocationDetailsCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [hoursDialogOpen, setHoursDialogOpen] = useState(false);

  // Format hours for display
  const formatHours = (hours: LocationData["hours"]) => {
    const hoursMap = new Map();
    hours.forEach((hour) => {
      hoursMap.set(hour.dayOfWeek, hour);
    });

    return dayNames.map((dayName, index) => {
      const dayHour = hoursMap.get(index);
      if (!dayHour || !dayHour.isOpen) {
        return { day: dayName, hours: "Closed" };
      }
      return {
        day: dayName,
        hours: `${dayHour.openTime} - ${dayHour.closeTime}`,
      };
    });
  };

  const formattedHours = formatHours(location.hours);

  return (
    <>
      {/* Notes Section */}
      <div className="rounded-lg border border-border bg-white px-6 py-4">
        <LocationNotesSection
          notes={location.locationNotes}
          locationId={location.id}
        />
      </div>

      {/* Google Maps */}
      <div className="rounded-lg border border-border bg-white px-2 py-2">
        <iframe
          width="100%"
          height="300"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps/embed/v1/place?key=${env.NEXT_PUBLIC_MAPS_EMBED_API_KEY}&q=${encodeURIComponent(location.address)}`}
          allowFullScreen
        ></iframe>
      </div>

      {/* Location Details */}
      <div className="rounded-lg border border-border bg-white px-6 py-4">
        <div className="flex flex-col gap-y-6">
          {/* Location Name */}
          <div className="flex flex-col gap-y-3">
            <div className="flex items-center">
              <p className="w-full font-medium">Location</p>
              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Edit Location</DialogTitle>
                  </DialogHeader>
                  <LocationEditForm
                    locationId={location.id}
                    initialData={{
                      name: location.name,
                      address: location.address,
                      email: location.email,
                      storageCapacity: location.storageCapacity,
                      locationType: location.locationType,
                    }}
                    onSuccess={() => setEditDialogOpen(false)}
                    onCancel={() => setEditDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
            <p className="text-sm text-secondary">{location.name}</p>
          </div>

          {/* Contact Information */}
          <div className="flex flex-col gap-y-3">
            <p className="font-medium">Contact information</p>
            <p className="text-sm text-secondary">{location.name}</p>
            <p className="text-gray text-sm">
              {location.email || "No email provided"}
            </p>
          </div>

          {/* Location Type */}
          <div className="flex flex-col gap-y-3">
            <p className="font-medium">Location type</p>
            <p className="text-sm text-secondary">
              {location.locationType === "AGENT" ? "Agent" : "Franchise"}
            </p>
          </div>

          {/* Storage Capacity */}
          <div className="flex flex-col gap-y-3">
            <p className="font-medium">Storage Capacity</p>
            <p className="text-sm text-secondary">
              {location.storageCapacity} units
            </p>
          </div>

          {/* Address */}
          <div className="flex flex-col gap-y-3">
            <p className="font-medium">Address information</p>
            <p className="text-sm text-secondary">{location.address}</p>
          </div>

          {/* Store Hours */}
          <div className="flex flex-col gap-y-3">
            <div className="flex items-center">
              <p className="w-full font-medium">Store Hours</p>
              <Dialog open={hoursDialogOpen} onOpenChange={setHoursDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Store Hours</DialogTitle>
                  </DialogHeader>
                  <div className="max-h-[70vh] overflow-y-auto">
                    <LocationHoursEditForm
                      locationId={location.id}
                      currentHours={location.hours}
                      onSuccess={() => setHoursDialogOpen(false)}
                      onCancel={() => setHoursDialogOpen(false)}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-1 text-sm">
              {formattedHours.map(({ day, hours }) => (
                <div key={day} className="flex justify-between">
                  <span>{day}:</span>
                  <span>{hours}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
