import {
  SafeAreaInsetsContext,
  SafeAreaView,
} from "react-native-safe-area-context";
import { Stack } from "expo-router/stack";

export default function Layout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
