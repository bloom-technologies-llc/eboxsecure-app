import { ScrollView, Text, View } from "react-native";

export default function Page() {
  return (
    <ScrollView style={{ flex: 1 }} className="bg-white">
      <View>
        <Text>Order detail</Text>
      </View>
    </ScrollView>
  );
}
