"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleArrowUp, Loader2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@ebox/ui/button";
import { Form, FormControl, FormField, FormItem } from "@ebox/ui/form";
import { Textarea } from "@ebox/ui/textarea";

import { api } from "~/trpc/react";

interface CustomerNotesSectionProps {
  customerId: string;
}

const noteSchema = z.object({
  text: z.string().min(1, "Note cannot be empty"),
});

export default function CustomerNotesSection({
  customerId,
}: CustomerNotesSectionProps) {
  const [isAddingNote, setIsAddingNote] = useState(false);

  const form = useForm<z.infer<typeof noteSchema>>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      text: "",
    },
  });

  const { data: notes, refetch } = api.customers.customerNotes.query.useQuery({
    customerId,
  });

  const createNoteMutation = api.customers.customerNotes.create.useMutation({
    onSuccess: () => {
      refetch();
      form.reset();
      setIsAddingNote(false);
    },
  });

  const onSubmit = (values: z.infer<typeof noteSchema>) => {
    createNoteMutation.mutate({
      customerId,
      text: values.text,
    });
  };

  return (
    <div className="rounded-lg border border-border bg-white px-6 py-4">
      <div className="flex flex-col gap-y-3">
        <div className="flex items-center justify-between">
          <p className="font-medium">Notes</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAddingNote(!isAddingNote)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Add Note Form */}
        {isAddingNote && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Add a note..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={createNoteMutation.isPending}
                >
                  {createNoteMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Note
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingNote(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        )}

        {/* Existing Notes */}
        {notes && notes.length > 0 ? (
          <div className="space-y-2">
            {notes.map((noteItem) => (
              <div key={noteItem.id} className="flex items-start gap-x-2">
                <CircleArrowUp className="mt-1 h-4 w-4 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{noteItem.note.text}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(noteItem.note.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !isAddingNote && <p className="text-sm text-gray-500">No notes yet</p>
        )}
      </div>
    </div>
  );
}
