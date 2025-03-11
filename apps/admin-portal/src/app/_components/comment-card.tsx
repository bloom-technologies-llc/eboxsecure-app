import { Trash2 } from "lucide-react";

interface CommentCardProps {
  name: string;
  time: string; //TODO: change to Date after backend integration
  comment: string;
}

export default function CommentCard({ name, time, comment }: CommentCardProps) {
  return (
    <div className="flex-flex-col w-full rounded-md border border-border bg-white px-4 py-3">
      <div className="flex flex-col gap-x-2">
        <div className="flex items-center">
          <div className="flex w-full gap-x-2">
            <p className="text-sm font-medium">{name}</p>
            <p className="text-gray text-sm">{time}</p>
          </div>

          <Trash2 className="h-4 w-4" />
        </div>

        <p className="text-gray">{comment}</p>
      </div>
    </div>
  );
}
