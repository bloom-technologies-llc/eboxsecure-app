import { SafeAreaView, Text, View } from "react-native";
import { Link } from "expo-router";

// import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";

export default function Page() {
  // const { user } = useUser();

  return (
    <SafeAreaView>
      {/* <SignedIn>
        <Text>Hello {user?.emailAddresses[0].emailAddress}</Text>
      </SignedIn>
      <SignedOut>
        <Link href="/explore">
          <Text className="text-2xl font-bold text-blue-900">Sign In</Text>
        </Link>
        <Link href="/explore">
          <Text className="text-xl italic text-red-600">Sign Up</Text>
        </Link>
      </SignedOut> */}
      <Text className="text-xl text-red-600">Hello</Text>
    </SafeAreaView>
  );
}
