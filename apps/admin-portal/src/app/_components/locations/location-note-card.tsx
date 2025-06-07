"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import type { RouterOutputs } from "@ebox/admin-api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@ebox/ui/alert-dialog";
import { Button } from "@ebox/ui/button";
import { Card, CardContent, CardHeader } from "@ebox/ui/card";
import { useToast } from "@ebox/ui/hooks/use-toast";
import { ToastAction } from "@ebox/ui/toast";

import { api } from "~/trpc/react";
import LocationNoteForm from "./location-note-form";

type LocationNote =
  RouterOutputs["locations"]["locationNotes"]["query"][number];

interface LocationNoteCardProps {
  locationNote: LocationNote;
  locationId: number;
}

export default function LocationNoteCard({
  locationNote,
  locationId,
}: LocationNoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const utils = api.useUtils();

  const { mutate: deleteNote } = api.locations.locationNotes.delete.useMutation(
    {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Note deleted successfully",
        });
        utils.locations.locationNotes.query.invalidate({ locationId });
        utils.locations.getLocationDetails.invalidate({ locationId });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
          action: (
            <ToastAction onClick={handleDelete} altText="Try again">
              Try again
            </ToastAction>
          ),
        });
      },
    },
  );

  const handleDelete = () => {
    deleteNote({ noteId: locationNote.note.id });
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card>
        <CardContent className="pt-6">
          <LocationNoteForm
            locationId={locationId}
            noteId={locationNote.note.id}
            initialText={locationNote.note.text}
            onSuccess={handleEditSuccess}
            onCancel={handleEditCancel}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-col">
          <p className="text-sm text-muted-foreground">
            {new Date(locationNote.note.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            {locationNote.note.createdAt !== locationNote.note.updatedAt && (
              <span className="ml-1 text-xs">(edited)</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-8 w-8 p-0"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Note</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this note? This action cannot
                  be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {locationNote.note.text}
        </p>
      </CardContent>
    </Card>
  );
}
