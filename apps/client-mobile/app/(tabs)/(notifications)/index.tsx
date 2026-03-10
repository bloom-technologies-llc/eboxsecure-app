import { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { DoubleCheckIcon } from "@/components/icons";
import { api } from "@/trpc/react";

export default function Page() {
  const router = useRouter();
  const utils = api.useUtils();

  const {
    data,
    isLoading,
    refetch,
    isRefetching,
  } = api.notification.getNotifications.useQuery({});

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

  const notifications = data?.notifications ?? [];

  const isToday = (date: string | Date) => {
    const d = new Date(date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  };

  const todayNotifications = notifications.filter((n) =>
    isToday(n.createdAt),
  );
  const olderNotifications = notifications.filter(
    (n) => !isToday(n.createdAt),
  );

  const handlePress = useCallback(
    (notification: (typeof notifications)[0]) => {
      if (!notification.read) {
        markAsRead({ notificationId: notification.id });
      }
      if (notification.orderId) {
        router.push({
          pathname: "/(tabs)/(orders)/order-detail",
          params: { orderId: notification.orderId.toString() },
        });
      }
    },
    [markAsRead, router],
  );

  const renderNotification = (notification: (typeof notifications)[0]) => (
    <Pressable
      key={notification.id}
      onPress={() => handlePress(notification)}
      className={`border border-[#e4e4e7] p-4 ${!notification.read ? "bg-[#F6F9FB]" : "bg-white"}`}
    >
      <View className="gap-y-1">
        <View className="flex flex-row justify-between">
          <Text className="flex-1 text-sm font-medium" numberOfLines={2}>
            {notification.message}
          </Text>
          <Text className="ml-2 text-xs text-[#575959]">
            {isToday(notification.createdAt)
              ? new Date(notification.createdAt).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })
              : new Date(notification.createdAt).toLocaleDateString()}
          </Text>
        </View>
        {notification.order && (
          <Text className="text-xs text-[#575959]">
            {notification.order.shippedLocation?.name ?? ""}
          </Text>
        )}
      </View>
    </Pressable>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={{ backgroundColor: "#ffffff", flex: 1 }}>
        <Text className="mx-4 my-4 text-2xl font-medium">Notifications</Text>
        <ActivityIndicator style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  const sections = [
    ...(todayNotifications.length > 0
      ? [{ type: "header" as const, title: "Today" }, ...todayNotifications.map((n) => ({ type: "notification" as const, data: n }))]
      : []),
    ...(olderNotifications.length > 0
      ? [{ type: "header" as const, title: "Previous" }, ...olderNotifications.map((n) => ({ type: "notification" as const, data: n }))]
      : []),
  ];

  return (
    <SafeAreaView style={{ backgroundColor: "#ffffff", flex: 1 }}>
      <Text className="mx-4 my-4 text-2xl font-medium">Notifications</Text>

      {(unreadData?.count ?? 0) > 0 && (
        <Pressable
          onPress={() => markAllAsRead()}
          className="flex-row items-center gap-x-2 border border-[#e4e4e7] px-4 py-3"
        >
          <DoubleCheckIcon />
          <Text className="text-[#333333]">Mark all as read</Text>
        </Pressable>
      )}

      <FlatList
        data={sections}
        keyExtractor={(item, index) =>
          item.type === "header" ? `header-${item.title}` : `notif-${item.data.id}`
        }
        renderItem={({ item }) => {
          if (item.type === "header") {
            return (
              <View className="bg-[#e4e4e7] px-4 py-3">
                <Text className="text-[#575959]">{item.title}</Text>
              </View>
            );
          }
          return renderNotification(item.data);
        }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-16">
            <Text className="text-[#575959]">No notifications</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
