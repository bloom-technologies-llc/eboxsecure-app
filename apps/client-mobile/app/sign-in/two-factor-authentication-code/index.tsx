import { useState } from "react";
import {
  Keyboard,
  SafeAreaView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { OtpInput } from "react-native-otp-entry";
import Toast from "react-native-root-toast";
import { useLocalSearchParams, useRouter } from "expo-router";
import BackBreadcrumb from "@/components/ui/BackBreadcrumb";
import { useSignInCredentials } from "@/hooks/useSignInCredentials";
import { isClerkAPIResponseError, useSignIn } from "@clerk/clerk-expo";
import { useLocalCredentials } from "@clerk/clerk-expo/local-credentials";

const TwoFactorAuthenticationCodePage = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [error, setError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();
  const { useLocal } = useLocalSearchParams<{ useLocal: string }>();
  const { setCredentials } = useLocalCredentials();

  const { password, emailAddress } = useSignInCredentials();
  const handleSubmit = async (code: string) => {
    if (!isLoaded) {
      return;
    }
    setError(""); // Clear any previous errors
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
        setError("Unable to verify the code. Please try again.");
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        // Handle specific Clerk API errors
        const clerkError = err.errors?.[0];
        if (clerkError?.code === "form_code_incorrect") {
          setError("Incorrect verification code. Please try again.");
        } else if (clerkError?.code === "verification_expired") {
          setError("Verification code has expired. Please request a new one.");
        } else if (clerkError?.code === "verification_failed") {
          setError(
            "Verification failed. Please try again or request a new code.",
          );
        } else {
          setError(
            clerkError?.longMessage ||
              clerkError?.message ||
              "Unable to verify the code. Please try again.",
          );
        }
      } else {
        setError("Unable to verify the code. Please try again.");
      }
      console.error(JSON.stringify(err, null, 2));
    }
  };

  async function resendTwoFactorCode() {
    if (!isLoaded) {
      return;
    }
    setIsResending(true);
    setError("");
    try {
      await signIn.prepareSecondFactor({ strategy: "phone_code" });
      Toast.show("New code sent to your mobile device!", {
        duration: 3000,
        position: Toast.positions.TOP,
        backgroundColor: "#e9f9ee",
        textColor: "#000",
      });
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        const clerkError = err.errors?.[0];
        setError(
          clerkError?.longMessage ||
            clerkError?.message ||
            "Unable to resend code. Please try again later.",
        );
      } else {
        setError("Unable to resend code. Please try again later.");
      }
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsResending(false);
    }
  }

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
        <TouchableOpacity
          className="rounded-md bg-gray-100 px-6 py-3"
          onPress={resendTwoFactorCode}
          disabled={isResending}
        >
          <Text className="text-center text-base font-semibold text-gray-800">
            {isResending ? "Resending..." : "Resend code"}
          </Text>
        </TouchableOpacity>
        {error && <Text className="text-red-600">{error}</Text>}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default TwoFactorAuthenticationCodePage;
