import { Text, View } from "react-native";
import { Link } from "expo-router";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";

export default function Page() {
  const { user } = useUser();

  return (
    <View>
      <SignedIn>
        <Text>Hello {user?.emailAddresses[0]?.emailAddress}</Text>
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
  );
}
