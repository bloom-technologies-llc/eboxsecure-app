"use client";

import React, { useState } from "react";
import {
  Keyboard,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { OtpInput } from "react-native-otp-entry";
import Toast from "react-native-root-toast";
import { Redirect, useRouter } from "expo-router";
import BackBreadcrumb from "@/components/ui/BackBreadcrumb";
import { isClerkAPIResponseError, useAuth, useSignIn } from "@clerk/clerk-expo";
import { useLocalCredentials } from "@clerk/clerk-expo/local-credentials";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  const [secondFactor, setSecondFactor] = useState(false);
  const [error, setError] = useState("");
  const [isResending, setIsResending] = useState(false);

  const router = useRouter();

  const { isSignedIn } = useAuth();
  const { isLoaded, signIn, setActive } = useSignIn();

  const { userOwnsCredentials, setCredentials } = useLocalCredentials();

  if (isSignedIn) {
    return <Redirect href={"/"} />;
  }

  // Send the password reset code to the user's email
  async function create() {
    setError("");
    await signIn
      ?.create({
        strategy: "reset_password_email_code",
        identifier: email,
      })
      .then((_) => {
        setSuccessfulCreation(true);
        setError("");
      })
      .catch((err) => {
        console.error("error", err.errors[0].longMessage);
        setError(err.errors[0].longMessage);
      });
  }

  // Reset the user's password.
  // Upon successful reset, the user will be
  // signed in and redirected to the home page
  async function reset() {
    if (!isLoaded) {
      return;
    }
    setError("");
    try {
      const attemptedReset = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });

      if (attemptedReset.status === "needs_second_factor") {
        await signIn.prepareSecondFactor({ strategy: "phone_code" });
        setSecondFactor(true);
      } else if (attemptedReset.status === "complete") {
        if (userOwnsCredentials) {
          await setCredentials({ password });
        }
        Toast.show("Successfully reset password!", {
          duration: 3000,
          position: Toast.positions.TOP,
          backgroundColor: "#e9f9ee",
          textColor: "#000",
        });
        await setActive({ session: attemptedReset.createdSessionId });
        router.replace("/");
      } else {
        setError("Error: unable to reset password. Pleas try again later.");
        console.error(JSON.stringify(attemptedReset, null, 2));
      }
    } catch (err) {
      setError("Error: unable to reset password. Pleas try again later.");
      console.error(JSON.stringify(err, null, 2));
    }
  }

  async function handleTwoFactorCode(code: string) {
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
        if (userOwnsCredentials) {
          await setCredentials({ password });
        }
        Toast.show("Successfully reset password!", {
          duration: 3000,
          position: Toast.positions.TOP,
          backgroundColor: "#e9f9ee",
          textColor: "#000",
        });
        setActive({ session: signInAttempt.createdSessionId });
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
  }

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
    <SafeAreaView className="mx-4 flex h-screen items-center gap-8">
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}
        accessible={false}
      >
        <>
          <BackBreadcrumb />

          {!successfulCreation && (
            <>
              <View className="flex max-w-sm flex-col items-center gap-4">
                <Text className="text-center text-4xl font-semibold">
                  Forgot Password?
                </Text>
                <Text className="text-center text-lg font-medium text-gray-700">
                  Provide your email address and we&apos;ll send you a code to
                  reset your password.
                </Text>
              </View>
              <View className="w-4/5">
                <TextInput
                  className="rounded-md border-2 border-gray-300 px-3 py-3 text-base text-gray-900"
                  value={email}
                  placeholder="name@example.com"
                  placeholderTextColor="#6b7280"
                  onChangeText={(e) => setEmail(e)}
                />
              </View>

              <TouchableOpacity
                className="rounded-md bg-gray-100 px-6 py-3"
                onPress={() => create()}
              >
                <Text className="text-center text-base font-semibold text-gray-800">
                  Send password reset code
                </Text>
              </TouchableOpacity>
              {error && <Text className="text-red-600">{error}</Text>}
            </>
          )}

          {successfulCreation && !secondFactor && (
            <>
              <View className="flex max-w-sm flex-col items-center gap-4">
                <Text className="text-center text-4xl font-semibold">
                  Reset your password
                </Text>
                <Text className="text-center text-lg font-medium text-gray-700">
                  Check your email for a password reset code and enter a new
                  password.
                </Text>
              </View>
              <View className="w-4/5">
                <Text className="mb-2 text-base font-medium text-gray-700">
                  Enter your new password
                </Text>
                <TextInput
                  className="mb-4 rounded-md border-2 border-gray-300 px-3 py-3 text-base text-gray-900"
                  secureTextEntry={true}
                  value={password}
                  onChangeText={(e) => setPassword(e)}
                  placeholder="New password"
                  placeholderTextColor="#6b7280"
                />
              </View>

              <View className="w-4/5">
                <Text className="mb-2 text-base font-medium text-gray-700">
                  Enter the password reset code that was sent to your email
                </Text>
                <TextInput
                  className="rounded-md border-2 border-gray-300 px-3 py-3 text-base text-gray-900"
                  value={code}
                  onChangeText={(e) => setCode(e)}
                  placeholder="Password reset code"
                  placeholderTextColor="#6b7280"
                />
              </View>

              <TouchableOpacity
                className="rounded-md bg-gray-100 px-6 py-3"
                onPress={() => reset()}
              >
                <Text className="text-center text-base font-semibold text-gray-800">
                  Reset password
                </Text>
              </TouchableOpacity>
              {error && <Text className="text-red-600">{error}</Text>}
            </>
          )}

          {secondFactor && (
            <SafeAreaView className="mx-4 flex h-screen items-center gap-8">
              <View className="flex max-w-sm flex-col items-center gap-4">
                <Text className="text-center text-4xl font-semibold">
                  Two-factor authentication
                </Text>
                <Text className="text-center text-lg font-medium text-gray-700">
                  Enter the one-time passcode sent to your mobile device to
                  reset your password.
                </Text>
              </View>
              <OtpInput
                numberOfDigits={6}
                onFilled={(code) => handleTwoFactorCode(code)}
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
          )}
        </>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default ForgotPasswordPage;
