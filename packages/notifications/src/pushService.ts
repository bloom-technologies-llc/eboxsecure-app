interface ExpoPushMessage {
  to: string;
  title?: string;
  body: string;
  data?: Record<string, any>;
  sound?: "default" | null;
}

export async function sendPushNotification(
  expoPushToken: string,
  title: string,
  body: string,
  data?: Record<string, any>,
): Promise<void> {
  const message: ExpoPushMessage = {
    to: expoPushToken,
    title,
    body,
    data,
    sound: "default",
  };

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Expo push notification failed:", errorText);
    }
  } catch (error) {
    console.error("Failed to send push notification:", error);
  }
}
