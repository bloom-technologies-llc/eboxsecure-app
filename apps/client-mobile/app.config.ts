import type { ConfigContext, ExpoConfig } from "expo/config";

const CLERK_PUBLISHABLE_KEY =
  "pk_test_bW9kZXJuLWZlbGluZS0xMS5jbGVyay5hY2NvdW50cy5kZXYk";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "EboxSecure",
  slug: "ebox-client-mobile",
  scheme: "expo",
  version: "0.3.14",
  orientation: "portrait",
  icon: "./assets/images/logos/eboxsecure-logo-ios.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/images/logos/eboxsecure-logo.png",
    resizeMode: "contain",
    backgroundColor: "#dbeafe",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    bundleIdentifier: "com.eboxsecure.eboxsecureclient",
    supportsTablet: true,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: "com.eboxsecure.eboxsecureclient",
    adaptiveIcon: {
      foregroundImage: "./assets/images/logos/eboxsecure-logo.png",
      backgroundColor: "#dbeafe",
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
  plugins: [
    "expo-router",
    [
      "expo-local-authentication",
      { faceIdPermission: "Allow EboxSecure to use Face ID." },
    ],
    [
      "expo-secure-store",
      {
        configureAndroidBackup: true,
        faceIDPermission:
          "Allow EBoxSecure to access your Face ID biometric data.",
      },
    ],
  ],
  newArchEnabled: true,
});
