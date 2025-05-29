"use client";

import { useRouter } from "next/navigation";
import { CommentType } from "@prisma/client";
import { Bell } from "lucide-react";

import { Button } from "@ebox/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ebox/ui/dropdown-menu";

import { api } from "~/trpc/react";

interface Notification {
  id: string;
  message: string;
  comment: {
    commentType: CommentType;
    orderComment?: {
      order: {
        id: number;
      };
    } | null;
  } | null;
}

const NotificationDropdown = () => {
  const router = useRouter();
  const { data: notifications } = api.notification.getNotifications.useQuery();

  const checkNotificationType = (notification: Notification) => {
    if (notification.comment?.commentType === CommentType.ORDER) {
      return CommentType.ORDER;
    }
    if (notification.comment?.commentType === CommentType.LOCATION) {
      return CommentType.LOCATION;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {notifications?.map((notification) => (
            <DropdownMenuItem
              onClick={() => {
                if (checkNotificationType(notification) === CommentType.ORDER) {
                  router.push(
                    `/orders/order-details/${notification?.comment?.orderComment?.order.id}`,
                  );
                }
              }}
              key={notification.id}
            >
              {notification.message}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
