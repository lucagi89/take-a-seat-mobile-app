import { Stack } from "expo-router";
import { UserContextProvider } from "../contexts/userContext";
import { Slot } from "expo-router";
import { SafeAreaView } from "react-native";
import { StripeProvider } from "@stripe/stripe-react-native";

export default function RootLayout() {
  return (
    <UserContextProvider>
      <StripeProvider publishableKey="pk_test_YourStripePublicKey">
        <SafeAreaView style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Slot />
          </Stack>
        </SafeAreaView>
      </StripeProvider>
    </UserContextProvider>
  );
}
