"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";

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

import { api } from "../../trpc/react";
import FileBadge from "./file-badge";

interface CommentCardProps {
  commentId: string;
  name: string;
  time: Date; //TODO: change to Date after backend integration
  comment: string;
  highlighted: string | null;
  filePaths?: string[];
}

// Helper function to extract file info from URL
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

export default function CommentCard({
  commentId,
  name,
  time,
  comment,
  highlighted,
  filePaths = [],
}: CommentCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [updatedComment, setUpdatedComment] = useState(comment);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { mutate: updateOrderComment } =
    api.orderComments.updateOrderComments.useMutation({
      onSuccess: () => {
        // Refresh the page to show updated comments (since comments are server-rendered)
        router.refresh();
        toast({
          description: "Your comment has been updated",
        });
      },
    });

  const { mutate: removeOrderComment } =
    api.orderComments.removeOrderComments.useMutation({
      onSuccess: () => {
        // Refresh the page to show updated comments (since comments are server-rendered)
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
    removeOrderComment({ commentId: commentId });
  };

  const handleUpdateComment = () => {
    updateOrderComment({ commentId: commentId, text: updatedComment });
    setIsEditing(false);
  };

  return (
    <div
      className={cn(
        "flex w-full flex-col rounded-md border border-border bg-white px-4 py-3",
        highlighted === commentId && "border-secondary bg-secondary/5",
      )}
    >
      <div className="flex flex-col gap-x-2">
        <div className="flex items-center">
          <div className="flex w-full gap-x-2">
            <p className="text-sm font-medium">{name}</p>
            <p className="text-gray text-sm">{time.toLocaleString()}</p>
          </div>
          {!isEditing && (
            <div className="gap-x flex items-center ">
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
                  setUpdatedComment(comment);
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
            <p className="text-gray">{comment}</p>
            {filePaths.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {filePaths.map((filePath, index) => (
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
