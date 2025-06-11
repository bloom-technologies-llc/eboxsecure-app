import React, { PropsWithChildren, useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useAuth } from "@clerk/clerk-expo";

export const SessionTimeoutWrapper: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const { isSignedIn, signOut } = useAuth();
  const backgroundTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === "background") {
        // Record when app goes to background
        backgroundTimeRef.current = Date.now();
        console.log("App went to background, recording time");
      } else if (nextAppState === "active" && backgroundTimeRef.current) {
        // Check session validity when app becomes active
        const currentTime = Date.now();
        const timeInBackground = currentTime - backgroundTimeRef.current;

        // 5 minutes session timeout
        const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

        console.log(
          `App became active, was in background for ${Math.round(timeInBackground / 1000)} seconds`,
        );

        if (isSignedIn && timeInBackground > SESSION_TIMEOUT) {
          console.info("Forcing sign out due to session timeout");
          await signOut();
        }

        // Reset background time
        backgroundTimeRef.current = null;
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, [isSignedIn, signOut]);

  return children;
};
