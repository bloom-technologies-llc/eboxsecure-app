import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Page() {
  return (
    <SafeAreaView>
      <View className="mx-4">
        <Text className="mb-4 text-2xl font-medium">Profile</Text>
      </View>
    </SafeAreaView>
  );
}
