import React, { useEffect } from "react";
import { Slot, usePathname } from "expo-router";
import { UserContextProvider } from "../contexts/userContext";
import {
  SafeAreaView,
  ActivityIndicator,
  Text,
  ImageBackground,
  View,
  StyleSheet,
} from "react-native";
import { StripeProvider } from "@stripe/stripe-react-native";
import { useRouter } from "expo-router";
import { useUser } from "../contexts/userContext";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import Map from "./map";

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
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading... (Check console for details)</Text>
      </SafeAreaView>
    );
  }

  return children;
}

export default function RootLayout() {
  const pathname = usePathname();
  const translateY = useSharedValue(1000); // Start off-screen (bottom)

  useEffect(() => {
    // Animate in when route changes (except for index)
    if (pathname !== "/") {
      translateY.value = withTiming(0, { duration: 300 }); // Slide up
    } else {
      translateY.value = withTiming(1000, { duration: 300 }); // Slide down
    }
  }, [pathname]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <UserContextProvider>
      <StripeProvider publishableKey="pk_test_YourStripePublicKey">
        <SafeAreaView style={styles.safeArea}>
          <AuthWrapper>
            <Map />
            <Animated.View
              style={[
                styles.overlay,
                animatedStyle,
                pathname === "/" && styles.hiddenOverlay,
              ]}
            >
              <Slot />
            </Animated.View>
          </AuthWrapper>
        </SafeAreaView>
      </StripeProvider>
    </UserContextProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  indexPageBackground: {
    flex: 1,
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  indexPageContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  indexPageText: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  hiddenOverlay: {
    backgroundColor: "transparent",
  },
});
