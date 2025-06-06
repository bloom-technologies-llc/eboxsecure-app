import React, { PropsWithChildren, useEffect } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useAuth } from "@clerk/clerk-expo";

export const SessionTimeoutWrapper: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const { isSignedIn, signOut } = useAuth();

  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === "background") {
        // Start a timer when app goes to background
        const backgroundTime = Date.now();

        // When app comes back to foreground, check session duration
        const checkSessionValidity = async () => {
          const currentTime = Date.now();
          const timeInBackground = currentTime - backgroundTime;

          // Define your session timeout (e.g., 5 minutes = 300000 ms)
          const SESSION_TIMEOUT = 1000 * 60; // 1 minute

          if (isSignedIn && timeInBackground > SESSION_TIMEOUT) {
            // Force sign out if timeout exceeded
            console.info("Forcing sign out due to session timeout");
            await signOut();
          }
        };

        AppState.addEventListener("change", (state) => {
          if (state === "active") {
            checkSessionValidity();
          }
        });
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
