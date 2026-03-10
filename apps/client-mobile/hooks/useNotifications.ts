import { useEffect, useRef } from "react";
import type { EventSubscription } from "expo-modules-core";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { api } from "@/trpc/react";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useNotifications() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const notificationListener = useRef<EventSubscription | null>(null);
  const responseListener = useRef<EventSubscription | null>(null);

  const { mutate: registerPushToken } =
    api.notification.registerPushToken.useMutation();

  useEffect(() => {
    if (!isSignedIn) return;

    async function registerForPush() {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        return;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      registerPushToken({ expoPushToken: tokenData.data });
    }

    registerForPush();

    notificationListener.current =
      Notifications.addNotificationReceivedListener(() => {
        // Notification received in foreground - no action needed,
        // the handler above will display it
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        if (data?.orderId) {
          router.push({
            pathname: "/(tabs)/(orders)/order-detail",
            params: { orderId: String(data.orderId) },
          });
        }
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [isSignedIn, registerPushToken, router]);
}
