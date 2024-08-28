import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { api } from "~/utils/api";

export default function Page() {
  const { data, isLoading } = api.order.unprotectedGetAllOrders.useQuery();

  if (isLoading)
    return (
      <SafeAreaView>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  return (
    <SafeAreaView style={{ backgroundColor: "#ffffff", flex: 1 }}>
      <View>
        <Text>Orders</Text>
        {data?.map((order) => <Text key={order.id}>{order.id}</Text>)}
      </View>
    </SafeAreaView>
  );
}
