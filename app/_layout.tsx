import { Stack } from "expo-router";
import { useUser, UserContextProvider } from "../contexts/userContext";
import { Slot, useRouter } from "expo-router";
import { SafeAreaView } from "react-native";

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
