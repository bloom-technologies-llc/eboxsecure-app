"use client";

import { MessageCircleWarning } from "lucide-react";

import type { RouterOutputs } from "@ebox/admin-api";
import { cn } from "@ebox/ui";

import CommentCard from "~/app/_components/comment-card";
import { groupCommentsByDate } from "~/app/utils/commentGrouping";
import LocationCommentCard from "./location-comment-card";

type LocationComment =
  RouterOutputs["locations"]["locationComments"]["query"][number];

interface LocationCommentsSectionProps {
  comments: LocationComment[];
  highlightedCommentId?: string | null;
  locationId: number;
}

export default function LocationCommentsSection({
  comments,
  highlightedCommentId,
  locationId,
}: LocationCommentsSectionProps) {
  if (!comments || comments.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        No comments yet. Be the first to add one!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-4">
      {groupCommentsByDate(comments).map(({ dateKey, comments }) => (
        <div key={dateKey} className="flex flex-col gap-y-4">
          <p className="text-gray text-sm">{dateKey}</p>
          <div className="flex flex-col gap-y-3">
            {comments.map((locationComment) => {
              const { comment } = locationComment;
              const isHighlighted = highlightedCommentId === comment.id;

              // Check if this is an activity comment (system generated)
              if (
                comment.text.includes("updated") ||
                comment.text.includes("changed") ||
                comment.text.includes("Email") ||
                comment.text.includes("Store hours")
              ) {
                return (
                  <div
                    key={comment.id}
                    className={cn(
                      "flex items-center gap-x-2 rounded-md border border-border bg-white px-4 py-3",
                      isHighlighted && "border-secondary bg-secondary/5",
                    )}
                  >
                    <MessageCircleWarning className="h-4 w-4" />
                    <p className="text-gray text-sm">{comment.text}</p>
                  </div>
                );
              }

              // Regular user comment
              return (
                <LocationCommentCard
                  key={comment.id}
                  commentId={comment.id}
                  name={comment.authorId || "Unknown User"} // TODO: Get actual user name from Clerk
                  time={comment.createdAt}
                  comment={comment.text}
                  highlighted={highlightedCommentId || null}
                  filePaths={comment.filePaths ?? []}
                  locationId={locationId}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
