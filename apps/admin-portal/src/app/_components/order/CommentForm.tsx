"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { CommentType } from "@prisma/client";
import { Paperclip, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@ebox/ui/button";
import { Form, FormControl, FormField, FormItem } from "@ebox/ui/form";
import { useToast } from "@ebox/ui/hooks/use-toast";
import { Skeleton } from "@ebox/ui/skeleton";
import { Textarea } from "@ebox/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ebox/ui/tooltip";

import { useFileUpload } from "~/app/hooks/useFileUpload";
import { useMentionTrigger } from "~/app/hooks/useMentionTrigger";
import { api } from "../../../trpc/react";
import FileBadge from "../file-badge";
import MentionDropdown from "./MentionDropdown";

interface CommentFormProps {
  orderId: number;
  locationId: number;
  locationEmployees: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }[];
}

const formSchema = z.object({
  comment: z.string().min(1, {
    message: "Comment cannot be empty.",
  }),
});

export default function CommentForm({
  orderId,
  locationEmployees,
}: CommentFormProps) {
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

  const { mutate: createOrderComment } =
    api.orderComments.createOrderComment.useMutation({
      onSuccess: () => {
        router.refresh();
        toast({
          description: "Your comment has been created",
        });
      },
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comment: "",
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

    createOrderComment({
      text: values.comment,
      commentType: CommentType.ORDER,
      orderId: orderId,
      authorId: user.id,
      filePaths: uploadedFiles.map((file) => file.url),
      notifications: mentionedUsers.map((user) => ({
        userId: user.id,
        message: `${user.display} was mentioned in a comment`,
      })),
    });

    form.reset();
    setMentionedUsers([]);
    clearAllFiles();
    if (textareaRef.current) {
      textareaRef.current.value = "";
    }
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
                    <MentionDropdown
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
            <div className="gap-x flex w-full">
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
            <Button disabled={isUploading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
