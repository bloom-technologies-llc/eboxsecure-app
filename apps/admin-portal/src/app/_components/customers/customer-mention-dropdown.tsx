"use client";

import { Info } from "lucide-react";

import { Popover, PopoverAnchor, PopoverContent } from "@ebox/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ebox/ui/tooltip";

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface CustomerMentionDropdownProps {
  showMentions: boolean;
  setShowMentions: (show: boolean) => void;
  mentionPosition: { x: number; y: number } | null;
  adminUsers: AdminUser[];
  selectedIndex: number;
  handleUserSelect: (user: AdminUser) => void;
  currentUserId?: string;
}

export default function CustomerMentionDropdown({
  showMentions,
  setShowMentions,
  mentionPosition,
  adminUsers,
  selectedIndex,
  handleUserSelect,
  currentUserId,
}: CustomerMentionDropdownProps) {
  return (
    <Popover open={showMentions} onOpenChange={setShowMentions}>
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
            <p className="text-sm">Admin Users</p>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>The mentioned user will be notified</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="border"></div>
          {adminUsers
            ?.filter((user) => user.id !== currentUserId)
            .map((user, index) => {
              return (
                <div
                  key={user.id}
                  className={`cursor-pointer rounded-sm px-2 py-1 ${
                    index === selectedIndex ? "bg-secondary-background" : ""
                  }`}
                  onClick={() => handleUserSelect(user)}
                >
                  <p className="text-sm">{user.firstName}</p>
                </div>
              );
            })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
