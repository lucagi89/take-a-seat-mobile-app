import { Stack } from "expo-router";
import { useUser, UserContextProvider } from "../contexts/userContext";
import { Redirect, Slot } from "expo-router";
import { View, ActivityIndicator } from "react-native";

export default function RootLayout() {
  return (
    <UserContextProvider>
      <AuthStack />
    </UserContextProvider>
  );
}

function AuthStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Slot />
    </Stack>
  );
}
