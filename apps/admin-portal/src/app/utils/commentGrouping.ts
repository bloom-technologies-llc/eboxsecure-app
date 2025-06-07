interface Comment {
  comment: {
    id: string;
    createdAt: Date;
    authorId: string;
    text: string;
    filePaths?: string[];
    [key: string]: any;
  };
}

interface GroupedComments {
  dateKey: string;
  comments: Comment[];
}

export function groupCommentsByDate<T extends Comment>(
  comments: T[],
): GroupedComments[] {
  if (!comments || comments.length === 0) {
    return [];
  }

  // Group comments by date
  const groupedComments: Map<
    string,
    { dateKey: string; comments: T[]; sortDate: Date }
  > = new Map();

  comments.forEach((comment) => {
    const commentDate = new Date(comment.comment.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let dateKey: string;
    let sortDate: Date;

    if (commentDate.toDateString() === today.toDateString()) {
      dateKey = "Today";
      sortDate = today;
    } else if (commentDate.toDateString() === yesterday.toDateString()) {
      dateKey = "Yesterday";
      sortDate = yesterday;
    } else {
      dateKey = commentDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          commentDate.getFullYear() !== today.getFullYear()
            ? "numeric"
            : undefined,
      });
      sortDate = new Date(
        commentDate.getFullYear(),
        commentDate.getMonth(),
        commentDate.getDate(),
      );
    }

    if (!groupedComments.has(dateKey)) {
      groupedComments.set(dateKey, { dateKey, comments: [], sortDate });
    }

    groupedComments.get(dateKey)!.comments.push(comment);
  });

  // Convert to array and sort by date (newest first: Today, Yesterday, then recent dates)
  return Array.from(groupedComments.values())
    .sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime())
    .map(({ dateKey, comments }) => {
      // Sort comments within each group by time (newest first)
      const sortedComments = comments.sort(
        (a, b) =>
          new Date(b.comment.createdAt).getTime() -
          new Date(a.comment.createdAt).getTime(),
      );

      return {
        dateKey,
        comments: sortedComments,
      };
    });
}
