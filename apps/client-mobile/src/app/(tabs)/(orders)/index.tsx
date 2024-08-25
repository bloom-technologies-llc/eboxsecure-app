import { Button, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { SignedIn, SignedOut, useAuth } from "@clerk/clerk-expo";

import { api } from "~/utils/api";
import QRModal from "./qr-modal";

export default function Page() {
  const { signOut, isSignedIn } = useAuth();

  const onPress = async () => {
    await signOut();
  };
  const { data, isLoading } = api.order.unprotectedGetAllOrders.useQuery();

  if (isLoading) {
    return <Text>Loading...</Text>;
  }
  return (
    <SafeAreaView style={{ backgroundColor: "#ffffff", flex: 1 }}>
      <View>
        <Text>You are: {isSignedIn ? "signed in" : "signed out"}</Text>
        <SignedIn>
          <Text className="mx-4 my-4 text-2xl font-medium">
            Order History. Orders:{" "}
            {data?.map((order) => <Text>{order.vendorOrderId}</Text>)}
          </Text>
          <Button // TODO: remove
            title="Press me to test sentry"
            onPress={() => {
              throw new Error("Hello, again, Sentry!");
            }}
          />
          <Link href={"../(orders)/order-detail"} asChild>
            <Pressable className=" w-full border border-[#e4e4e7] p-4">
              <View className="flex flex-row items-center gap-x-2">
                <View className="h-24 w-24 rounded-lg bg-slate-300"></View>
                <View className="flex gap-y-3">
                  <View className="flex">
                    <Text className="">Ready for pickup</Text>
                    <Text className="text-sm text-[#575959]">
                      Delivered to My EBOX location 3
                    </Text>
                  </View>
                  <QRModal />
                </View>
              </View>
            </Pressable>
          </Link>

          <Link href={"../(orders)/order-detail"} asChild>
            <Pressable className=" w-full border border-t-0 border-[#e4e4e7] p-4">
              <View className="flex flex-row items-center gap-x-2">
                <View className="h-24 w-24 rounded-lg bg-slate-300"></View>
                <View className="flex gap-y-3">
                  <View className="flex">
                    <Text className="">Ready for pickup</Text>
                    <Text className="text-sm text-[#575959]">
                      Delivered to My EBOX location 3
                    </Text>
                  </View>
                  <QRModal />
                </View>
              </View>
            </Pressable>
          </Link>

          <Link href={"../(orders)/order-detail"} asChild>
            <Pressable className=" w-full border border-t-0 border-[#e4e4e7] p-4">
              <View className="flex flex-row items-center gap-x-2">
                <View className="h-24 w-24 rounded-lg bg-slate-300"></View>
                <View className="flex gap-y-3">
                  <View className="flex">
                    <Text className="">Ready for pickup</Text>
                    <Text className="text-sm text-[#575959]">
                      Delivered to My EBOX location 3
                    </Text>
                  </View>
                  <QRModal />
                </View>
              </View>
            </Pressable>
          </Link>

          <Link href={"../(orders)/order-detail"} asChild>
            <Pressable className=" w-full border border-t-0 border-[#e4e4e7] p-4">
              <View className="flex flex-row items-center gap-x-2">
                <View className="h-24 w-24 rounded-lg bg-slate-300"></View>
                <View className="flex gap-y-3">
                  <View className="flex">
                    <Text className="">Ready for pickup</Text>
                    <Text className="text-sm text-[#575959]">
                      Delivered to My EBOX location 3
                    </Text>
                  </View>
                  <QRModal />
                </View>
              </View>
            </Pressable>
          </Link>

          <Link href={"../(orders)/order-detail"} asChild>
            <Pressable className=" w-full border border-t-0 border-[#e4e4e7] p-4">
              <View className="flex flex-row items-center gap-x-2">
                <View className="h-24 w-24 rounded-lg bg-slate-300"></View>
                <View className="flex gap-y-3">
                  <View className="flex">
                    <Text className="">Ready for pickup</Text>
                    <Text className="text-sm text-[#575959]">
                      Delivered to My EBOX location 3
                    </Text>
                  </View>
                  <QRModal />
                </View>
              </View>
            </Pressable>
          </Link>
          <Button title="Sign out!" onPress={onPress} />
        </SignedIn>
        <SignedOut>
          <Link href="/sign-in">
            <Text>Sign In</Text>
          </Link>
          <Link href="/sign-up">
            <Text>Sign Up</Text>
          </Link>
        </SignedOut>
      </View>
    </SafeAreaView>
  );
}
