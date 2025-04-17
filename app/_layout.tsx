import { Stack } from "expo-router";
import { SafeAreaView, StyleSheet } from "react-native";
import { UserContextProvider } from "../contexts/userContext";

export default function RootLayout() {
  return (
    <UserContextProvider>
      <SafeAreaView style={styles.safeArea}>
        <Stack />
      </SafeAreaView>
    </UserContextProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
