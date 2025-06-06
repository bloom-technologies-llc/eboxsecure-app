"use client";

import { Info } from "lucide-react";

import { Popover, PopoverAnchor, PopoverContent } from "@ebox/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ebox/ui/tooltip";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface MentionDropdownProps {
  showMentions: boolean;
  setShowMentions: (show: boolean) => void;
  mentionPosition: { x: number; y: number } | null;
  locationEmployees: Employee[];
  selectedIndex: number;
  handleUserSelect: (employee: Employee) => void;
  currentUserId?: string;
}

export default function MentionDropdown({
  showMentions,
  setShowMentions,
  mentionPosition,
  locationEmployees,
  selectedIndex,
  handleUserSelect,
  currentUserId,
}: MentionDropdownProps) {
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
            <p className="text-sm">Employees in this location</p>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>The mentioned employee will be notified</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="border"></div>
          {locationEmployees
            ?.filter((employee) => employee.id !== currentUserId)
            .map((employee, index) => {
              return (
                <div
                  key={employee.id}
                  className={`cursor-pointer rounded-sm px-2 py-1 ${
                    index === selectedIndex ? "bg-secondary-background" : ""
                  }`}
                  onClick={() => handleUserSelect(employee)}
                >
                  <p className="text-sm">{employee.firstName}</p>
                </div>
              );
            })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
