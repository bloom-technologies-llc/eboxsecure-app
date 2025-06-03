"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { CommentType } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  AtSign,
  CircleArrowUp,
  Info,
  MessageCircleWarning,
  Paperclip,
  Pencil,
  Send,
} from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@ebox/ui/button";
import { Form, FormControl, FormField, FormItem } from "@ebox/ui/form";
import { useToast } from "@ebox/ui/hooks/use-toast";
import { Popover, PopoverAnchor, PopoverContent } from "@ebox/ui/popover";
import { Textarea } from "@ebox/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@ebox/ui/tooltip";

import { useFileUpload } from "~/app/hooks/useFileUpload";
import { useMentionTrigger } from "~/app/hooks/useMentionTrigger";
import CommentCard from "../../../../_components/comment-card";
import FileBadge from "../../../../_components/file-badge";
import { api } from "../../../../../trpc/react";

interface OrderDetailsClientProps {
  orderDetails: {
    id: number;
    customer: {
      id: string;
    };
    shippedLocation: {
      id: number;
    };
  };
}

export default function OrderDetailsClient({
  orderDetails,
}: OrderDetailsClientProps) {
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
  } = useMentionTrigger();
  const { id, customer, shippedLocation } = orderDetails;
  const router = useRouter();
  const orderId = id;

  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const highlightedCommentId = searchParams.get("highlight");

  const { data: locationEmployees } =
    api.orderComments.getLocationEmployees.useQuery({
      locationId: shippedLocation.id,
    });

  const { data: queryOrderComments } =
    api.orderComments.queryOrderComments.useQuery({
      orderId: orderId,
    });

  const { mutate: createOrderComment } =
    api.orderComments.createOrderComment.useMutation({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [["orderComments", "queryOrderComments"]],
        });
        toast({
          description: "Your comment has been created",
        });
      },
    });

  const formSchema = z.object({
    comment: z.string().min(1, {
      message: "Comment cannot be empty.",
    }),
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
    // Reset the input so the same file can be selected again
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

  useEffect(() => {
    console.log(locationEmployees);
  }, [locationEmployees]);

  return (
    <main className="bg-pageBackground w-full">
      <div className="container w-full py-16 md:w-11/12">
        <div
          className="my-6 flex cursor-pointer items-center gap-x-2"
          onClick={() => router.push("/orders")}
        >
          <ArrowLeft className="h-4 w-4" />
          <p>#{orderId}</p>
        </div>
        <div className="grid grid-cols-3 gap-x-6">
          {/* comment section container */}
          <div className="col-span-2 flex flex-col gap-y-2 ">
            <div className="flex flex-col gap-y-6">
              <div className="flex flex-col gap-y-2">
                {/* comment section */}
                <div className="flex flex-col rounded-md  border border-border bg-white">
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="rounded-b-none"
                    >
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
                                ></Textarea>
                                <Popover
                                  open={showMentions}
                                  onOpenChange={setShowMentions}
                                >
                                  <PopoverAnchor
                                    className="absolute left-0 top-0"
                                    style={{
                                      left: mentionPosition?.x + "px",
                                      top: mentionPosition?.y + "px",
                                    }}
                                  />
                                  <PopoverContent
                                    onOpenAutoFocus={(e) => e.preventDefault()}
                                    onCloseAutoFocus={(e) => e.preventDefault()}
                                  >
                                    <div className="flex flex-col gap-y-2">
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm">
                                          Employees in this location
                                        </p>
                                        <TooltipProvider delayDuration={100}>
                                          <Tooltip>
                                            <TooltipTrigger>
                                              <Info className="h-4 w-4 cursor-help text-muted-foreground" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>
                                                The mentioned employee will be
                                                notified
                                              </p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      </div>
                                      <div className="border"></div>
                                      {locationEmployees
                                        ?.filter(
                                          (employee) =>
                                            employee.id !== user?.id,
                                        )
                                        .map((employee, index) => {
                                          return (
                                            <div
                                              key={employee.id}
                                              className={`cursor-pointer rounded-sm px-2 py-1 ${
                                                index === selectedIndex
                                                  ? "bg-secondary-background"
                                                  : ""
                                              }`}
                                              onClick={() =>
                                                handleUserSelect(employee)
                                              }
                                            >
                                              <p className="text-sm">
                                                {employee.firstName}
                                              </p>
                                            </div>
                                          );
                                        })}
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      ></FormField>
                      <div className="bg-secondary-background flex items-center rounded-md rounded-t-none border-t border-border px-2 py-2">
                        <div className="gap-x flex w-full">
                          <Button variant="ghost" size="icon" type="button">
                            <AtSign className="h-4 w-4" />
                          </Button>
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
              </div>

              <div className="flex flex-col gap-y-4">
                <p className="text-gray text-sm">Today</p>
                <div className="flex flex-col gap-y-3">
                  <div className="flex items-center gap-x-2">
                    <MessageCircleWarning className="h-4 w-4" />
                    <p className="text-gray text-sm">
                      Jane Eyre changed this customer's email
                      hello.kitty@gmail.com
                    </p>
                  </div>
                  {queryOrderComments?.map((comment) => {
                    return (
                      <CommentCard
                        highlighted={highlightedCommentId}
                        key={comment.comment.id}
                        commentId={comment.comment.id}
                        name={comment.comment.authorId}
                        time={comment.comment.createdAt}
                        comment={comment.comment.text}
                        filePaths={comment.comment.filePaths}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Details Section Container */}
          <div className="flex w-fit flex-col gap-y-6">
            <div className="rounded-lg border border-border bg-white px-6 py-4">
              <div className="flex flex-col gap-y-3">
                <p className="font-medium">Shipping information</p>
                <div className="flex items-center gap-x-2">
                  <CircleArrowUp className="h-4 w-4" />
                  <p className="text-gray text-sm">Shipping label created</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-white px-6 py-4">
              <div className="flex flex-col gap-y-6">
                <div className="flex flex-col gap-y-3">
                  <div className="flex items-center">
                    <p className="w-full font-medium">Customer</p>
                    <Pencil className="text-gray h-4 w-4" />
                  </div>
                  <p className="text-sm text-secondary">Henry Ford</p>
                </div>

                <div className="flex flex-col gap-y-3">
                  <p className="font-medium ">Contact information</p>
                  <p className="text-sm text-secondary">henry@gmail.com</p>
                  <p className="text-gray text-sm">732-555-1234</p>
                </div>

                <div className="flex flex-col gap-y-3">
                  <p className="font-medium">Shipping address</p>
                  <p className="text-gray text-sm">
                    123 Main St, Anytown, USA 12345
                  </p>
                </div>

                <div className="flex flex-col gap-y-3">
                  <p className="font-medium">Billing address</p>
                  <p className="text-gray text-sm">Same as shipping address</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-white px-6 py-4">
              <div className="flex flex-col gap-y-3">
                <p className="font-medium">Eligible recipients</p>
                <div className="flex items-center gap-x-2">
                  <CircleArrowUp className="h-4 w-4" />
                  <p className="text-gray text-sm">N/A</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
