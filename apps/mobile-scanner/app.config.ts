import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "EboxSecure Mobile Scanner",
  slug: "ebox-mobile-scanner",
  scheme: "expo",
  version: "0.0.1",
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
    bundleIdentifier: "com.eboxsecure.eboxsecuremobilescanner",
    supportsTablet: true,
  },
  android: {
    package: "com.eboxsecure.eboxsecuremobilescanner",
    adaptiveIcon: {
      foregroundImage: "./assets/images/logos/eboxsecure-logo.png",
      backgroundColor: "#dbeafe",
    },
  },
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true,
  },
  plugins: ["expo-router"],
  newArchEnabled: true,
});
