import type { ClerkAPIError } from "@clerk/types";
import type { TextInput } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Switch as RNSwitch,
  TextInput as RNTextInput,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Link, Redirect, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { SymbolView } from "expo-symbols";
import logo from "@/assets/images/logos/eboxsecure-logo.png";
import { isClerkAPIResponseError, useAuth, useSignIn } from "@clerk/clerk-expo";
import { useLocalCredentials } from "@clerk/clerk-expo/local-credentials";

import { useSignInCredentials } from "../../hooks/useSignInCredentials";

// Add these constants at the top of the file, outside the component
const REMEMBER_EMAIL_KEY = "remember_email_preference";
const STORED_EMAIL_KEY = "stored_email";

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<ClerkAPIError[]>([]);
  const [rememberEmail, setRememberEmail] = useState(false);

  const { hasCredentials, setCredentials, authenticate, biometricType } =
    useLocalCredentials();
  const {
    setPassword: setLocalPassword,
    setEmailAddress: setLocalEmailAddress,
  } = useSignInCredentials();

  const passwordRef = useRef<TextInput>(null);

  // Add this useEffect to load saved preferences
  useEffect(() => {
    const loadSavedEmail = async () => {
      try {
        const [savedPreference, savedEmail] = await Promise.all([
          SecureStore.getItemAsync(REMEMBER_EMAIL_KEY),
          SecureStore.getItemAsync(STORED_EMAIL_KEY),
        ]);

        if (savedPreference === "true" && savedEmail) {
          setRememberEmail(true);
          setEmailAddress(savedEmail);
        }
      } catch (error) {
        console.error("Error loading saved email:", error);
      }
    };

    loadSavedEmail();
  }, []);

  const onSignInPress = useCallback(
    async (useLocal = false) => {
      if (!isLoaded) {
        return;
      }
      setErrors([]);
      try {
        const signInAttempt =
          hasCredentials && useLocal
            ? await authenticate() // biometric
            : await signIn.create({
                // user/pass
                identifier: emailAddress,
                password,
              });
        if (signInAttempt.status === "complete") {
          // Store email if remember is enabled
          if (rememberEmail) {
            await Promise.all([
              SecureStore.setItemAsync(REMEMBER_EMAIL_KEY, "true"),
              SecureStore.setItemAsync(STORED_EMAIL_KEY, emailAddress),
            ]);
          }

          if (!useLocal) {
            await setCredentials({ identifier: emailAddress, password });
          }
          await setActive({ session: signInAttempt.createdSessionId });
          router.replace("/");
        } else if (signInAttempt.status === "needs_second_factor") {
          if (!useLocal) {
            setLocalEmailAddress(emailAddress);
            setLocalPassword(password);
          }
          await signIn.prepareSecondFactor({ strategy: "phone_code" });
          router.push(
            `/sign-in/two-factor-authentication-code?useLocal=${useLocal}`,
          );
        }
      } catch (err) {
        if (isClerkAPIResponseError(err)) setErrors(err.errors);
        console.error(JSON.stringify(err, null, 2));
      }
    },
    [isLoaded, emailAddress, password, rememberEmail],
  );

  useEffect(() => {
    const signInLocal = async () => {
      if (!isLoaded) return;
      if (hasCredentials) {
        const signInAttempt = await authenticate();
        if (signInAttempt.status === "complete") {
          await setActive({ session: signInAttempt.createdSessionId });
          router.replace("/");
        } else if (signInAttempt.status === "needs_second_factor") {
          await signIn.prepareSecondFactor({ strategy: "phone_code" });
          router.push(`/sign-in/two-factor-authentication-code?useLocal=true`);
        }
      }
    };
    signInLocal().catch((err) => console.error(err));
  }, [isLoaded, hasCredentials, setActive, router]);

  // Add handler for remember email toggle
  const handleRememberEmailToggle = async (value: boolean) => {
    setRememberEmail(value);
    if (!value) {
      // Clear stored email when toggling off
      await Promise.all([
        SecureStore.deleteItemAsync(REMEMBER_EMAIL_KEY),
        SecureStore.deleteItemAsync(STORED_EMAIL_KEY),
      ]);
    } else {
      // Save current preference when toggling on
      await SecureStore.setItemAsync(REMEMBER_EMAIL_KEY, "true");
      if (emailAddress) {
        await SecureStore.setItemAsync(STORED_EMAIL_KEY, emailAddress);
      }
    }
  };

  if (isSignedIn) {
    return <Redirect href={"/"} />;
  }

  return (
    <SafeAreaView className="flex items-center justify-around gap-8 p-6">
      <Image
        source={logo}
        style={{ width: 169, height: 120, backgroundColor: "transparent" }}
      />
      <View className="w-full px-8">
        <Text className="mb-2 text-base font-medium text-gray-700">Email</Text>
        <RNTextInput
          className="mb-4 rounded-md border-2 border-gray-300 px-3 py-3 text-base text-gray-900"
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Email..."
          placeholderTextColor="#6b7280"
          onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
          returnKeyType="next"
          onSubmitEditing={() => {
            // Focus the password input using ref
            passwordRef.current?.focus();
          }}
        />
        {/* Add Remember Email toggle */}
        <View className="mb-4 mt-2 flex flex-row items-center justify-between">
          <Text className="text-base font-medium text-gray-700">
            Remember my email
          </Text>
          <RNSwitch
            value={rememberEmail}
            onValueChange={handleRememberEmailToggle}
          />
        </View>
        <Text className="mb-2 text-base font-medium text-gray-700">
          Password
        </Text>
        <RNTextInput
          ref={passwordRef}
          className="mb-4 rounded-md border-2 border-gray-300 px-3 py-3 text-base text-gray-900"
          value={password}
          placeholder="Password..."
          placeholderTextColor="#6b7280"
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
          returnKeyType="done"
          onSubmitEditing={() => {
            if (emailAddress && password) {
              onSignInPress();
            }
          }}
        />
        {errors && (
          <View className="mt-4">
            {errors.map((el, index) => (
              <Text key={index} className="text-red-600">
                {el.longMessage}
              </Text>
            ))}
          </View>
        )}
      </View>
      <View className="flex w-3/5 flex-col gap-4">
        <TouchableOpacity
          className="rounded-md bg-white px-6 py-3"
          onPress={() => onSignInPress()}
        >
          <Text className="text-center text-base font-semibold text-black">
            Sign in
          </Text>
        </TouchableOpacity>
        {hasCredentials && biometricType && (
          <View className="mx-auto">
            <TouchableOpacity onPress={() => onSignInPress(true)}>
              <SymbolView
                name={
                  biometricType === "face-recognition" ? "faceid" : "touchid"
                }
                type="monochrome"
              />
            </TouchableOpacity>
          </View>
        )}
        <Link href="/sign-in/forgot-password" className="mx-auto">
          Forgot password?
        </Link>
      </View>
    </SafeAreaView>
  );
}
