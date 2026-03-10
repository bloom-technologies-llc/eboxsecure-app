"use client";

import { useRouter } from "next/navigation";
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

import { api } from "@/trpc/react";

const NotificationDropdown = () => {
  const router = useRouter();
  const utils = api.useUtils();

  const { data } = api.notification.getNotifications.useQuery({});
  const { data: unreadData } = api.notification.getUnreadCount.useQuery();

  const { mutate: markAsRead } = api.notification.markAsRead.useMutation({
    onSuccess: () => {
      utils.notification.getNotifications.invalidate();
      utils.notification.getUnreadCount.invalidate();
    },
  });

  const { mutate: markAllAsRead } =
    api.notification.markAllAsRead.useMutation({
      onSuccess: () => {
        utils.notification.getNotifications.invalidate();
        utils.notification.getUnreadCount.invalidate();
      },
    });

  const { mutate: clearAll } = api.notification.clearAll.useMutation({
    onSuccess: () => {
      utils.notification.getNotifications.invalidate();
      utils.notification.getUnreadCount.invalidate();
    },
  });

  const notifications = data?.notifications ?? [];
  const unreadCount = unreadData?.count ?? 0;

  const handleNotificationClick = (notification: (typeof notifications)[0]) => {
    if (!notification.read) {
      markAsRead({ notificationId: notification.id });
    }

    if (notification.orderId) {
      router.push(`/orders/${notification.orderId}`);
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const todayNotifications = notifications.filter((n) =>
    isToday(new Date(n.createdAt)),
  );
  const olderNotifications = notifications.filter(
    (n) => !isToday(new Date(n.createdAt)),
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] leading-none text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96" align="end">
        <div className="flex items-center justify-between px-2 py-2">
          <DropdownMenuLabel className="py-0">Notifications</DropdownMenuLabel>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-muted-foreground"
                onClick={() => markAllAsRead()}
              >
                Mark all as read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-muted-foreground hover:text-destructive"
                onClick={() => clearAll()}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />

        {notifications.length === 0 && (
          <div className="px-2 py-8 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        )}

        {todayNotifications.length > 0 && (
          <>
            <div className="bg-muted px-3 py-1.5">
              <p className="text-xs text-muted-foreground">Today</p>
            </div>
            <DropdownMenuGroup>
              {todayNotifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "flex flex-col items-start gap-1 px-3 py-3",
                    !notification.read && "bg-[#F6F9FB]",
                  )}
                >
                  <span className="text-sm">{notification.message}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(notification.createdAt).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        )}

        {olderNotifications.length > 0 && (
          <>
            <div className="bg-muted px-3 py-1.5">
              <p className="text-xs text-muted-foreground">
                Older notifications
              </p>
            </div>
            <DropdownMenuGroup>
              {olderNotifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "flex flex-col items-start gap-1 px-3 py-3",
                    !notification.read && "bg-[#F6F9FB]",
                  )}
                >
                  <span className="text-sm">{notification.message}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
