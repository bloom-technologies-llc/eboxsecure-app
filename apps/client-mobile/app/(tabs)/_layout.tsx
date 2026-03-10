import * as React from "react";
import { Redirect, Tabs } from "expo-router";
import { BellIcon, ShoppingCartIcon, UserIcon } from "@/components/icons";
import { useAuth } from "@clerk/clerk-expo";
import { MapPin } from "phosphor-react-native";
import { api } from "@/trpc/react";
import { useNotifications } from "@/hooks/useNotifications";
import { ActivityIndicator, View, Text, TouchableOpacity, StyleSheet, Linking } from "react-native";

export default function TabLayout() {
  const { isSignedIn, signOut } = useAuth();
  useNotifications();
  const { data: unreadData } = api.notification.getUnreadCount.useQuery(
    undefined,
    { enabled: !!isSignedIn },
  );
  const { data: isSubscribed, isLoading } = api.subscription.isSubscribed.useQuery(
    undefined,
    {
      networkMode: 'always',
    }
  );

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }
  if (isLoading) {
    return <ActivityIndicator size="large" />;
  }
  if (!isSubscribed) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Subscription Required</Text>
          <Text style={styles.message}>
            Your account is not subscribed to an EboxSecure plan.{"\n\n"}
            Please visit{" "}
            <Text 
              style={styles.link} 
              onPress={() => Linking.openURL("https://app.eboxsecure.com")}
            // TODO: make link qa/prod
            >
              app.eboxsecure.com
            </Text>
            {" "}to choose a plan.
          </Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => signOut()}
          >
            <Text style={styles.buttonText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="(orders)"
        options={{
          title: "Orders",
          tabBarIcon: () => <ShoppingCartIcon />,
        }}
      />
      <Tabs.Screen
        name="(locations)"
        options={{
          title: "Locations",
          tabBarIcon: ({ color, size }) => (
            <MapPin size={size || 24} color={color || "#000"} />
          ),
        }}
      />
      <Tabs.Screen
        name="(notifications)"
        options={{
          title: "Notifications",
          tabBarIcon: () => <BellIcon />,
          tabBarBadge: (unreadData?.count ?? 0) > 0 ? unreadData!.count : undefined,
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: "Profile",
          tabBarIcon: () => <UserIcon />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    color: '#666',
    marginBottom: 30,
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    minWidth: 200,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
