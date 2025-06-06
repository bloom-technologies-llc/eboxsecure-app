import { groupCommentsByDate } from "../../utils/commentGrouping";
import CommentCard from "../comment-card";

interface Comment {
  comment: {
    id: string;
    text: string;
    authorId: string;
    createdAt: Date;
    filePaths?: string[];
  };
}

interface CommentsSectionProps {
  comments: Comment[];
  highlightedCommentId?: string | null;
}

export default function CommentsSection({
  comments,
  highlightedCommentId,
}: CommentsSectionProps) {
  if (!comments || comments.length === 0) {
    return (
      <div className="flex flex-col gap-y-4">
        <p className="text-gray text-sm">No comments yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-4">
      {groupCommentsByDate(comments).map(({ dateKey, comments }) => (
        <div key={dateKey} className="flex flex-col gap-y-4">
          <p className="text-gray text-sm">{dateKey}</p>
          <div className="flex flex-col gap-y-3">
            {comments.map((comment) => (
              <CommentCard
                highlighted={highlightedCommentId ?? null}
                key={comment.comment.id}
                commentId={comment.comment.id}
                name={comment.comment.authorId || "Unknown"}
                time={comment.comment.createdAt}
                comment={comment.comment.text}
                filePaths={comment.comment.filePaths ?? []}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
