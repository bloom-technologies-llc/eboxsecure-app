"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { Paperclip, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@ebox/ui/button";
import { Form, FormControl, FormField, FormItem } from "@ebox/ui/form";
import { useToast } from "@ebox/ui/hooks/use-toast";
import { Textarea } from "@ebox/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ebox/ui/tooltip";

import FileBadge from "~/app/_components/file-badge";
import { useFileUpload } from "~/app/hooks/useFileUpload";
import { useMentionTrigger } from "~/app/hooks/useMentionTrigger";
import { api } from "~/trpc/react";
import LocationMentionDropdown from "./location-mention-dropdown";

const formSchema = z.object({
  comment: z.string().min(1, {
    message: "Comment cannot be empty.",
  }),
});

interface LocationCommentFormContainerProps {
  locationId: number;
}

export default function LocationCommentFormContainer({
  locationId,
}: LocationCommentFormContainerProps) {
  const uploadFileRef = useRef<HTMLInputElement>(null);
  const { uploadedFiles, isUploading, uploadFiles, removeFile, clearAllFiles } =
    useFileUpload();
  const {
    showMentions,
    setShowMentions,
    handleInputChange,
    mentionPosition,
    textareaRef,
    handleKeyDown,
    selectedIndex,
    handleUserSelect,
    mentionedUsers,
    setMentionedUsers,
  } = useMentionTrigger({
    onValueChange: (value) => {
      form.setValue("comment", value);
    },
  });

  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const utils = api.useUtils();

  // Get location employees for mentions
  const { data: locationEmployees } =
    api.locations.getLocationEmployees.useQuery({
      locationId,
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comment: "",
    },
  });

  const { mutate: createComment, isPending } =
    api.locations.locationComments.create.useMutation({
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Comment added successfully",
        });
        form.reset();
        setMentionedUsers([]);
        clearAllFiles();
        if (textareaRef.current) {
          textareaRef.current.value = "";
        }
        // Invalidate both the comments query and location details
        utils.locations.locationComments.query.invalidate({ locationId });
        utils.locations.getLocationDetails.invalidate({ locationId });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      uploadFiles(files);
    }
    if (uploadFileRef.current) {
      uploadFileRef.current.value = "";
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!user) return;

    createComment({
      text: values.comment,
      locationId,
      filePaths: uploadedFiles.map((file) => file.url),
      notifications: mentionedUsers.map((mentionedUser) => ({
        userId: mentionedUser.id,
        message: `${mentionedUser.display} was mentioned in a location comment`,
      })),
    });
  };

  return (
    <div className="flex flex-col rounded-md border border-border bg-white">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-b-none">
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex flex-col gap-y-2">
                    {uploadedFiles.length > 0 && (
                      <div className="p-4 pb-0">
                        <div className="flex flex-wrap gap-2">
                          {uploadedFiles.map((file, index) => (
                            <FileBadge
                              key={index}
                              file={file}
                              onRemove={removeFile}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    <Textarea
                      ref={textareaRef}
                      placeholder="Leave a comment..."
                      className="rounded-none border border-none px-4 py-6"
                      onKeyDown={(e) =>
                        handleKeyDown(e, locationEmployees ?? [])
                      }
                      onChange={(e) => {
                        field.onChange(e);
                        handleInputChange(
                          e.target.value,
                          e.target.selectionStart,
                        );
                      }}
                    />
                    <LocationMentionDropdown
                      showMentions={showMentions}
                      setShowMentions={setShowMentions}
                      mentionPosition={mentionPosition}
                      locationEmployees={locationEmployees}
                      selectedIndex={selectedIndex}
                      handleUserSelect={handleUserSelect}
                      currentUserId={user?.id}
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          <div className="bg-secondary-background flex items-center rounded-md rounded-t-none border-t border-border px-2 py-2">
            <div className="flex w-full gap-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => {
                      uploadFileRef.current?.click();
                    }}
                    variant="ghost"
                    size="icon"
                    type="button"
                    disabled={isUploading}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Attach a file</p>
                </TooltipContent>
              </Tooltip>

              <input
                ref={uploadFileRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.mp3,.mpeg"
                multiple
                className="hidden"
                onChange={handleUploadFile}
              />
            </div>
            <Button type="submit" disabled={isPending || isUploading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
