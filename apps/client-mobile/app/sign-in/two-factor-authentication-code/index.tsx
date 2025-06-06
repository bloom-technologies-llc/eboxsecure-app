import { useState } from "react";
import {
  Keyboard,
  SafeAreaView,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { OtpInput } from "react-native-otp-entry";
import { useLocalSearchParams, useRouter } from "expo-router";
import BackBreadcrumb from "@/components/ui/BackBreadcrumb";
import { useSignInCredentials } from "@/hooks/useSignInCredentials";
import { useSignIn } from "@clerk/clerk-expo";
import { useLocalCredentials } from "@clerk/clerk-expo/local-credentials";

const TwoFactorAuthenticationCodePage = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [error, setError] = useState("");
  const router = useRouter();
  const { useLocal } = useLocalSearchParams<{ useLocal: string }>();
  const { setCredentials } = useLocalCredentials();

  const { password, emailAddress } = useSignInCredentials();
  const handleSubmit = async (code: string) => {
    if (!isLoaded) {
      return;
    }
    try {
      const signInAttempt = await signIn.attemptSecondFactor({
        strategy: "phone_code",
        code,
      });

      if (signInAttempt.status === "complete") {
        if (useLocal !== "true") {
          await setCredentials({ identifier: emailAddress, password });
        }
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else {
        setError("Unable to sign in. Please try again later.");
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      setError("Unable to sign in. Please try again later.");
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}
      accessible={false}
    >
      <SafeAreaView className="mx-4 flex h-screen items-center gap-8">
        <BackBreadcrumb />
        <View className="flex max-w-sm flex-col items-center gap-4">
          <Text className="text-center text-4xl font-semibold">
            Two-factor authentication
          </Text>
          <Text className="text-center text-lg font-medium text-gray-700">
            Enter the one-time passcode sent to your mobile device.
          </Text>
        </View>
        <OtpInput
          numberOfDigits={6}
          onFilled={(code) => handleSubmit(code)}
          textInputProps={{ accessibilityLabel: "One-Time Passcode" }}
          focusColor={"#015778"}
          hideStick
        />
        {error && <Text className="text-red-600">{error}</Text>}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default TwoFactorAuthenticationCodePage;
