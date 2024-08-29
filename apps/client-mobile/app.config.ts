import type { ConfigContext, ExpoConfig } from "expo/config";

const CLERK_PUBLISHABLE_KEY =
  "pk_test_bW9kZXJuLWZlbGluZS0xMS5jbGVyay5hY2NvdW50cy5kZXYk";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "ebox-client-mobile",
  slug: "ebox-client-mobile",
  scheme: "expo",
  version: "0.1.36",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/icon.png",
    resizeMode: "contain",
    backgroundColor: "#1F104A",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    bundleIdentifier: "com.eboxsecure.eboxsecureclient",
    supportsTablet: true,
  },
  android: {
    package: "com.eboxsecure.eboxsecureclient",
    adaptiveIcon: {
      foregroundImage: "./assets/icon.png",
      backgroundColor: "#1F104A",
    },
  },
  extra: {
    eas: {
      projectId: "35ebb21b-a7a1-4995-9edd-b68490f1646f",
    },
    CLERK_PUBLISHABLE_KEY,
  },
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true,
  },
  plugins: ["expo-router"],
});
