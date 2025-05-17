import { useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";

import { Button } from "@ebox/ui/button";

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

  const { mutate: removeOrderComment } =
    api.orderComments.removeOrderComments.useMutation({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [["orderComments", "queryOrderComments"]],
        });
      },
    });

  const handleRemoveComment = async () => {
    removeOrderComment({ commentId: commentId });
  };

  return (
    <div className="flex-flex-col w-full rounded-md border border-border bg-white px-4 py-3">
      <div className="flex flex-col gap-x-2">
        <div className="flex items-center">
          <div className="flex w-full gap-x-2">
            <p className="text-sm font-medium">{name}</p>
            <p className="text-gray text-sm">{time.toLocaleString()}</p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleRemoveComment()}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-gray">{comment}</p>
      </div>
    </div>
  );
}
