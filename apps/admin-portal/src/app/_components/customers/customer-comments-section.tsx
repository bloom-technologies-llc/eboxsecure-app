"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircleWarning, Pencil, Trash2 } from "lucide-react";

import type { RouterOutputs } from "@ebox/admin-api";
import { cn } from "@ebox/ui";
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
import { useToast } from "@ebox/ui/hooks/use-toast";
import { Input } from "@ebox/ui/input";
import { ToastAction } from "@ebox/ui/toast";

import { api } from "~/trpc/react";
import FileBadge from "../file-badge";

type CustomerComment =
  RouterOutputs["customers"]["customerComments"]["query"][number];

interface CustomerCommentsSectionProps {
  comments: CustomerComment[];
  highlightedCommentId: string | null;
  customerId: string;
}

interface GroupedComments {
  [date: string]: CustomerComment[];
}

// Helper function to extract file info from URL (same as orders system)
function getFileInfoFromUrl(url: string) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const fileName = pathname.split("/").pop() || "Unknown file";

    // Try to determine file type from extension
    const extension = fileName.split(".").pop()?.toLowerCase();
    let type = "application/octet-stream";

    if (extension) {
      const typeMap: Record<string, string> = {
        pdf: "application/pdf",
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        gif: "image/gif",
        webp: "image/webp",
        mp3: "audio/mpeg",
        mpeg: "audio/mpeg",
      };
      type = typeMap[extension] || type;
    }

    return {
      name: fileName,
      url,
      size: 0, // We don't have size info from URL
      type,
    };
  } catch {
    return {
      name: "Unknown file",
      url,
      size: 0,
      type: "application/octet-stream",
    };
  }
}

interface CustomerCommentCardProps {
  commentItem: CustomerComment;
  highlightedCommentId: string | null;
  getCommentTime: (date: Date) => string;
}

function CustomerCommentCard({
  commentItem,
  highlightedCommentId,
  getCommentTime,
}: CustomerCommentCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [updatedComment, setUpdatedComment] = useState(
    commentItem.comment.text,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { mutate: updateCustomerComment } =
    api.customers.customerComments.update.useMutation({
      onSuccess: () => {
        router.refresh();
        toast({
          description: "Your comment has been updated",
        });
      },
    });

  const { mutate: removeCustomerComment } =
    api.customers.customerComments.remove.useMutation({
      onSuccess: () => {
        router.refresh();
        toast({
          description: "Your comment has been removed",
        });
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with your request.",
          action: (
            <ToastAction onClick={handleRemoveComment} altText="Try again">
              Try again
            </ToastAction>
          ),
        });
      },
    });

  const handleRemoveComment = () => {
    removeCustomerComment({ commentId: commentItem.comment.id });
  };

  const handleUpdateComment = () => {
    updateCustomerComment({
      commentId: commentItem.comment.id,
      text: updatedComment,
    });
    setIsEditing(false);
  };

  return (
    <div
      className={cn(
        "flex w-full flex-col rounded-md border border-border bg-white px-4 py-3",
        highlightedCommentId === commentItem.comment.id &&
          "border-secondary bg-secondary/5",
      )}
    >
      <div className="flex flex-col gap-x-2">
        <div className="flex items-center">
          <div className="flex w-full gap-x-2">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-gray text-sm">
              {getCommentTime(commentItem.comment.createdAt)}
            </p>
          </div>
          {!isEditing && (
            <div className="gap-x flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsEditing(true);
                  setTimeout(() => {
                    inputRef.current?.focus();
                  }, 0);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your comment.
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive hover:bg-destructive/90"
                        onClick={handleRemoveComment}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogHeader>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
        {isEditing ? (
          <div className="flex flex-col gap-y-2">
            <Input
              ref={inputRef}
              className="border-none px-0 text-base shadow-none"
              type="text"
              value={updatedComment}
              onChange={(e) => setUpdatedComment(e.target.value)}
            />

            <div className="gap-x flex justify-end">
              <Button
                variant="primary"
                onClick={() => {
                  setIsEditing(false);
                  setUpdatedComment(commentItem.comment.text);
                }}
              >
                Cancel
              </Button>
              <Button variant="ghost" onClick={handleUpdateComment}>
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-y-2">
            <p className="text-gray">{commentItem.comment.text}</p>
            {commentItem.comment.filePaths &&
              commentItem.comment.filePaths.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {commentItem.comment.filePaths.map((filePath, index) => (
                    <FileBadge
                      key={index}
                      file={getFileInfoFromUrl(filePath)}
                      showRemove={false}
                    />
                  ))}
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CustomerCommentsSection({
  comments,
  highlightedCommentId,
  customerId,
}: CustomerCommentsSectionProps) {
  // Group comments by date
  const groupedComments: GroupedComments = useMemo(() => {
    return comments.reduce((groups: GroupedComments, comment) => {
      const date = new Date(comment.comment.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date]!.push(comment);
      return groups;
    }, {});
  }, [comments]);

  const formatDateGroup = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const getCommentTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (comments.length === 0) {
    return (
      <div className="flex flex-col gap-y-4">
        <p className="text-gray text-sm">No comments yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-6">
      {Object.entries(groupedComments)
        .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
        .map(([dateString, dateComments]) => (
          <div key={dateString} className="flex flex-col gap-y-4">
            <p className="text-gray text-sm">{formatDateGroup(dateString)}</p>
            <div className="flex flex-col gap-y-3">
              {dateComments
                .sort(
                  (a: CustomerComment, b: CustomerComment) =>
                    new Date(b.comment.createdAt).getTime() -
                    new Date(a.comment.createdAt).getTime(),
                )
                .map((commentItem: CustomerComment) => {
                  // Check if this is a system-generated comment (pickup event, etc.)
                  const isSystemComment =
                    commentItem.comment.text.includes("picked up Order #");

                  if (isSystemComment) {
                    return (
                      <div
                        key={commentItem.comment.id}
                        className="flex items-center gap-x-2"
                      >
                        <MessageCircleWarning className="h-4 w-4" />
                        <p className="text-gray text-sm">
                          {commentItem.comment.text}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <CustomerCommentCard
                      key={commentItem.comment.id}
                      commentItem={commentItem}
                      highlightedCommentId={highlightedCommentId}
                      getCommentTime={getCommentTime}
                    />
                  );
                })}
            </div>
          </div>
        ))}
    </div>
  );
}
