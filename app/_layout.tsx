import { Slot } from "expo-router";
import { SafeAreaView, StyleSheet } from "react-native";
import { UserContextProvider } from "../contexts/userContext";

export default function RootLayout() {
  return (
    <UserContextProvider>
      <SafeAreaView style={styles.safeArea}>
        <InnerLayout />
      </SafeAreaView>
    </UserContextProvider>
  );
}

import { useRouter } from "expo-router";
import { useUser } from "../contexts/userContext";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";

function InnerLayout() {
  const { user } = useUser();
  const router = useRouter();
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    if (user === null) {
      router.replace("/login");
    } else {
      setInitialCheckDone(true);
    }
  }, [user]);

  if (user === undefined || !initialCheckDone) {
    return <ActivityIndicator size="large" color="#FFCA28" />;
  }

  return <Slot />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
