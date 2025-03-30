import { Slot } from "expo-router";
import { SafeAreaView, StyleSheet, ActivityIndicator } from "react-native";
import { UserContextProvider } from "../contexts/userContext";
import { useRootNavigationState, Redirect } from "expo-router";

export default function RootLayout() {
  const navigationState = useRootNavigationState();
  if (!navigationState?.key) {
    // If the navigation state is not ready, we can return null or a loading indicator
    return (
      <ActivityIndicator
        size="large"
        color="#0000ff"
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Slot />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
