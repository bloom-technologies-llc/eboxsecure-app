import { Button, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { SignedIn, SignedOut, useAuth } from "@clerk/clerk-expo";

export default function Page() {
  const { signOut } = useAuth();

  return (
    <SafeAreaView style={{ backgroundColor: "#ffffff", flex: 1 }}>
      <View>
        <Text className="mx-4 my-4 text-2xl font-medium">Notifications</Text>
        <SignedIn>
          <Button onPress={() => signOut()} title="Sign out" />
        </SignedIn>
        <SignedOut>
          <Link href="/sign-in">
            <Text>Sign in</Text>
          </Link>
        </SignedOut>
      </View>
    </SafeAreaView>
  );
}
