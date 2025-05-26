import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";

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

interface CommentCardProps {
  commentId: string;
  name: string;
  time: Date; //TODO: change to Date after backend integration
  comment: string;
}

export default function CommentCard({
  commentId,
  name,
  time,
  comment,
}: CommentCardProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [updatedComment, setUpdatedComment] = useState(comment);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { mutate: updateOrderComment } =
    api.orderComments.updateOrderComments.useMutation({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [["orderComments", "queryOrderComments"]],
        });
        toast({
          description: "Your comment has been updated",
        });
      },
    });

  const { mutate: removeOrderComment } =
    api.orderComments.removeOrderComments.useMutation({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [["orderComments", "queryOrderComments"]],
        });
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
    <div className="flex-flex-col w-full rounded-md border border-border bg-white px-4 py-3">
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
          <p className="text-gray">{comment}</p>
        )}
      </div>
    </div>
  );
}
