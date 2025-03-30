import { Slot } from "expo-router";
import { SafeAreaView, StyleSheet, ActivityIndicator } from "react-native";
import { UserContextProvider } from "../contexts/userContext";
import { useRootNavigationState, Redirect } from "expo-router";
import { useSegments } from "expo-router";

export default function RootLayout() {
  const navigationState = useRootNavigationState();
  const segments = useSegments();

  // if (!navigationState?.key) {
  //   return (
  //     <ActivityIndicator
  //       size="large"
  //       color="#0000ff"
  //       style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
  //     />
  //   );
  // }

  // If we're at the root route (no segments), redirect to map
  const isRootRoute = segments.length === 0;

  return (
    <UserContextProvider>
      <SafeAreaView style={styles.safeArea}>
        {/* {isRootRoute ? <Redirect href="/map" /> : <Slot />} */}
        <Slot />
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
