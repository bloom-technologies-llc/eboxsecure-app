import type { ConfigContext, ExpoConfig } from "expo/config";

const CLERK_PUBLISHABLE_KEY =
  "pk_test_bW9kZXJuLWZlbGluZS0xMS5jbGVyay5hY2NvdW50cy5kZXYk";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "EboxSecureTestClerk",
  slug: "ebox-client-mobile-test-clerk",
  scheme: "ebox-schema-test-clerk",
  version: "0.0.1",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/images/icon.png",
    resizeMode: "contain",
    backgroundColor: "#dbeafe",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    bundleIdentifier: "com.eboxsecure.eboxsecureclienttestclerk",
    supportsTablet: true,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: "com.eboxsecure.eboxsecureclienttestclerk",
    adaptiveIcon: {
      foregroundImage: "./assets/images/icon.png",
      backgroundColor: "#dbeafe",
    },
  },
  extra: {
    eas: {
      projectId: "bd4e3c8f-e071-46f9-9f5c-eca2b03629d7",
    },
    CLERK_PUBLISHABLE_KEY,
  },
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true,
  },
  plugins: ["expo-router"],
  newArchEnabled: true,
});
