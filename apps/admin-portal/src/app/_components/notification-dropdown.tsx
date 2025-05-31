"use client";

import { useRouter } from "next/navigation";
import { CommentType } from "@prisma/client";
import { Bell, Trash2 } from "lucide-react";

import { cn } from "@ebox/ui";
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
import { useToast } from "@ebox/ui/hooks/use-toast";

import { api } from "~/trpc/react";

interface Notification {
  id: string;
  message: string;
  read: boolean;
  comment: {
    id: string;
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
  const utils = api.useUtils();
  const { toast } = useToast();

  const { mutate: markAsRead } = api.notification.markAsRead.useMutation({
    onSuccess: () => {
      utils.notification.getNotifications.invalidate();
    },
  });

  const { mutate: clearAll } =
    api.notification.clearAllNotifications.useMutation({
      onSuccess: () => {
        utils.notification.getNotifications.invalidate();
        toast({
          description: "All notifications cleared",
        });
      },
    });

  const checkNotificationType = (notification: Notification) => {
    if (notification.comment?.commentType === CommentType.ORDER) {
      return CommentType.ORDER;
    }
    if (notification.comment?.commentType === CommentType.LOCATION) {
      return CommentType.LOCATION;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead({ notificationId: notification.id });
    }

    if (checkNotificationType(notification) === CommentType.ORDER) {
      router.push(
        `/orders/order-details/${notification?.comment?.orderComment?.order.id}?highlight=${notification.comment?.id}`,
      );
    }
  };

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] leading-none text-white">
              {unreadCount}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <div className="flex items-center justify-between px-2 py-2">
          <DropdownMenuLabel className="py-0">Notifications</DropdownMenuLabel>
          {notifications && notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground hover:text-destructive"
              onClick={() => clearAll()}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Clear all
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {notifications?.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={cn(
                "flex items-center gap-2",
                notification.read && "text-muted-foreground",
              )}
            >
              {notification.message}
            </DropdownMenuItem>
          ))}
          {(!notifications || notifications.length === 0) && (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
