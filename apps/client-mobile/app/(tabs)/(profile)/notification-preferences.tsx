import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Toast from "react-native-root-toast";
import { api } from "@/trpc/react";

export default function NotificationPreferencesPage() {
  const router = useRouter();
  const utils = api.useUtils();

  const { data: preferences, isLoading } =
    api.notification.getPreferences.useQuery();

  const { mutate: updatePreferences, isPending } =
    api.notification.updatePreferences.useMutation({
      onSuccess: () => {
        utils.notification.getPreferences.invalidate();
        Toast.show("Settings saved", { duration: Toast.durations.SHORT });
      },
      onError: () => {
        Toast.show("Failed to save settings", {
          duration: Toast.durations.SHORT,
        });
      },
    });

  const [settings, setSettings] = useState({
    pushEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    notificationEmail: "",
    phoneNumber: "",
  });

  useEffect(() => {
    if (preferences) {
      setSettings({
        pushEnabled: preferences.pushEnabled,
        emailEnabled: preferences.emailEnabled,
        smsEnabled: preferences.smsEnabled,
        notificationEmail: preferences.notificationEmail ?? "",
        phoneNumber: preferences.phoneNumber ?? "",
      });
    }
  }, [preferences]);

  const handleSave = () => {
    updatePreferences({
      pushEnabled: settings.pushEnabled,
      emailEnabled: settings.emailEnabled,
      smsEnabled: settings.smsEnabled,
      notificationEmail: settings.notificationEmail || null,
      phoneNumber: settings.phoneNumber || null,
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ backgroundColor: "#ffffff", flex: 1 }}>
        <ActivityIndicator style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ backgroundColor: "#ffffff", flex: 1 }}>
      <View className="flex-row items-center border-b border-[#e4e4e7] px-4 py-4">
        <Pressable onPress={() => router.back()}>
          <Text className="text-[#00698F]">Back</Text>
        </Pressable>
        <Text className="ml-4 text-xl font-medium">
          Notification Preferences
        </Text>
      </View>

      <View className="px-4 py-4">
        <View className="mb-6">
          <View className="flex-row items-center justify-between py-4">
            <View className="flex-1">
              <Text className="text-base font-medium text-[#333333]">
                Push Notifications
              </Text>
              <Text className="text-sm text-[#575959]">
                Receive push notifications on your device
              </Text>
            </View>
            <Switch
              value={settings.pushEnabled}
              onValueChange={(value) =>
                setSettings((prev) => ({ ...prev, pushEnabled: value }))
              }
              trackColor={{ true: "#00698F" }}
            />
          </View>

          <View className="flex-row items-center justify-between py-4">
            <View className="flex-1">
              <Text className="text-base font-medium text-[#333333]">
                Email Notifications
              </Text>
              <Text className="text-sm text-[#575959]">
                Receive notifications via email
              </Text>
            </View>
            <Switch
              value={settings.emailEnabled}
              onValueChange={(value) =>
                setSettings((prev) => ({ ...prev, emailEnabled: value }))
              }
              trackColor={{ true: "#00698F" }}
            />
          </View>

          {settings.emailEnabled && (
            <View className="mb-4 ml-4">
              <Text className="mb-1 text-sm text-[#575959]">
                Notification Email (optional)
              </Text>
              <TextInput
                className="rounded-md border border-[#e4e4e7] px-3 py-2"
                placeholder="Leave blank for account email"
                value={settings.notificationEmail}
                onChangeText={(text) =>
                  setSettings((prev) => ({
                    ...prev,
                    notificationEmail: text,
                  }))
                }
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          )}

          <View className="flex-row items-center justify-between py-4">
            <View className="flex-1">
              <Text className="text-base font-medium text-[#333333]">
                SMS Notifications
              </Text>
              <Text className="text-sm text-[#575959]">
                Receive text message notifications
              </Text>
            </View>
            <Switch
              value={settings.smsEnabled}
              onValueChange={(value) =>
                setSettings((prev) => ({ ...prev, smsEnabled: value }))
              }
              trackColor={{ true: "#00698F" }}
            />
          </View>

          {settings.smsEnabled && (
            <View className="mb-4 ml-4">
              <Text className="mb-1 text-sm text-[#575959]">Phone Number</Text>
              <TextInput
                className="rounded-md border border-[#e4e4e7] px-3 py-2"
                placeholder="+1 (555) 123-4567"
                value={settings.phoneNumber}
                onChangeText={(text) =>
                  setSettings((prev) => ({ ...prev, phoneNumber: text }))
                }
                keyboardType="phone-pad"
              />
            </View>
          )}
        </View>

        <Pressable
          onPress={handleSave}
          disabled={isPending}
          className="items-center rounded-md bg-[#00698F] py-3"
        >
          <Text className="text-base font-medium text-white">
            {isPending ? "Saving..." : "Save Settings"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
