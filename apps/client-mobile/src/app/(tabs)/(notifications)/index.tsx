import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";

export default function Page() {
  return (
    <SafeAreaView style={{ backgroundColor: "#ffffff", flex: 1 }}>
      <View>
        <Text className="mx-4 my-4 text-2xl font-medium">Notifications</Text>
        publishable key: {Constants.expoConfig?.extra?.CLERK_PUBLISHABLE_KEY}
      </View>
    </SafeAreaView>
  );
}
