import React, { useEffect } from "react";
import { Slot } from "expo-router"; // Removed useRootNavigationState
import { UserContextProvider } from "../contexts/userContext";
import { SafeAreaView, ActivityIndicator, Text } from "react-native";
import { StripeProvider } from "@stripe/stripe-react-native";
import { useRouter } from "expo-router";
import { useUser } from "../contexts/userContext";

function AuthWrapper({ children }) {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    console.log("User Loading:", userLoading);
    console.log("User:", user);

    if (!userLoading && !user) {
      router.replace("/login");
    }
  }, [user, userLoading, router]);

  if (userLoading) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading... (Check console for details)</Text>
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
