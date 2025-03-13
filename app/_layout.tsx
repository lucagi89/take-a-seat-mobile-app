import React, { useEffect } from "react";
import { Slot, useRootNavigationState } from "expo-router"; // Removed Stack import
import { UserContextProvider } from "../contexts/userContext";
import { SafeAreaView, ActivityIndicator } from "react-native";
import { StripeProvider } from "@stripe/stripe-react-native";
import { useRouter } from "expo-router";
import { useUser } from "../contexts/userContext";

function AuthWrapper({ children }) {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) {
      return; // Wait for navigation to be ready
    }
    if (!userLoading && !user) {
      router.replace("/login"); // Redirect to login if not authenticated
    }
  }, [user, userLoading, router, navigationState?.key]);

  if (userLoading || !navigationState?.key) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  return children;
}

export default function RootLayout() {
  return (
    <UserContextProvider>
      <StripeProvider publishableKey="pk_test_YourStripePublicKey">
        <SafeAreaView style={{ flex: 1 }}>
          <AuthWrapper>
            <Slot />
          </AuthWrapper>
        </SafeAreaView>
      </StripeProvider>
    </UserContextProvider>
  );
}
