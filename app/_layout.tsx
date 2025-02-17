import { Stack } from "expo-router";
import { useUser, UserContextProvider } from "../contexts/userContext";
import { Redirect, Slot } from "expo-router";
import { View, ActivityIndicator, SafeAreaView } from "react-native";

export default function RootLayout() {
  return (
    <UserContextProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Slot />
        </Stack>
      </SafeAreaView>
    </UserContextProvider>
  );
}
