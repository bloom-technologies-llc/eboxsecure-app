"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import type { RouterOutputs } from "@ebox/admin-api";
import { Button } from "@ebox/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ebox/ui/card";

import LocationNoteCard from "./location-note-card";
import LocationNoteForm from "./location-note-form";

type LocationNote =
  RouterOutputs["locations"]["locationNotes"]["query"][number];

interface LocationNotesSectionProps {
  notes: LocationNote[];
  locationId: number;
}

export default function LocationNotesSection({
  notes,
  locationId,
}: LocationNotesSectionProps) {
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddSuccess = () => {
    setShowAddForm(false);
  };

  const handleAddCancel = () => {
    setShowAddForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Notes</h3>
        <Button
          onClick={() => setShowAddForm(true)}
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Note
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardContent className="pt-6">
            <LocationNoteForm
              locationId={locationId}
              onSuccess={handleAddSuccess}
              onCancel={handleAddCancel}
            />
          </CardContent>
        </Card>
      )}

      {notes.length === 0 && !showAddForm ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-center text-muted-foreground">
              No notes yet. Add a note to keep track of important information
              about this location.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notes.map((locationNote) => (
            <LocationNoteCard
              key={locationNote.note.id}
              locationNote={locationNote}
              locationId={locationId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
