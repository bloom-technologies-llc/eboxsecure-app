"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Textarea } from "@ebox/ui/textarea";

import { api } from "~/trpc/react";

const noteSchema = z.object({
  text: z.string().min(1, "Note cannot be empty"),
});

interface LocationNoteFormProps {
  locationId: number;
  noteId?: string;
  initialText?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function LocationNoteForm({
  locationId,
  noteId,
  initialText = "",
  onSuccess,
  onCancel,
}: LocationNoteFormProps) {
  const { toast } = useToast();
  const utils = api.useUtils();
  const isEditing = !!noteId;

  const form = useForm<z.infer<typeof noteSchema>>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      text: initialText,
    },
  });

  const { mutate: createNote, isPending: isCreating } =
    api.locations.locationNotes.create.useMutation({
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Note created successfully",
        });
        form.reset();
        utils.locations.locationNotes.query.invalidate({ locationId });
        utils.locations.getLocationDetails.invalidate({ locationId });
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

  const { mutate: updateNote, isPending: isUpdating } =
    api.locations.locationNotes.update.useMutation({
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Note updated successfully",
        });
        utils.locations.locationNotes.query.invalidate({ locationId });
        utils.locations.getLocationDetails.invalidate({ locationId });
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

  const isPending = isCreating || isUpdating;

  const onSubmit = (values: z.infer<typeof noteSchema>) => {
    if (isEditing && noteId) {
      updateNote({
        noteId,
        text: values.text,
      });
    } else {
      createNote({
        locationId,
        text: values.text,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isEditing ? "Edit Note" : "Add Note"}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter your note here..."
                  className="min-h-[100px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : isEditing ? "Update Note" : "Add Note"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
