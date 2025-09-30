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
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: "com.eboxsecure.eboxsecuremobilescanner",
    adaptiveIcon: {
      foregroundImage: "./assets/images/logos/eboxsecure-logo.png",
      backgroundColor: "#dbeafe",
    },
  },
  extra: {
    eas: {
      projectId: "906b8892-7c01-4e44-84b6-1eface492af1",
    },
  },
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true,
  },
  plugins: ["expo-router"],
  newArchEnabled: true,
});
