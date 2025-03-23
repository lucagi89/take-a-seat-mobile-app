import React, { useState, useEffect } from "react";
import { Slot, useRouter } from "expo-router";
import { UserContextProvider } from "../contexts/userContext";
import {
  SafeAreaView,
  ActivityIndicator,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { StripeProvider } from "@stripe/stripe-react-native";
import { useUser } from "../contexts/userContext";
import Map from "./map";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

function AuthWrapper({ children }) {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    console.log("User Loading:", userLoading);
    console.log("User:", user);

    if (!userLoading && !user) {
      router.replace("/login");
    } else if (!userLoading && user) {
      router.replace("/");
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
  const router = useRouter();
  const [currentRoute, setCurrentRoute] = useState("/"); // Track the current route
  const translateY = useSharedValue(1000); // Start off-screen (bottom)

  const handleRouteChange = (route) => {
    setCurrentRoute(route);
  };

  useEffect(() => {
    if (currentRoute !== "/") {
      translateY.value = withTiming(0, { duration: 300 }); // Slide up
    } else {
      translateY.value = withTiming(1000, { duration: 300 }); // Slide down
    }
  }, [currentRoute]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <UserContextProvider>
      <StripeProvider publishableKey="pk_test_YourStripePublicKey">
        <SafeAreaView style={styles.safeArea}>
          <AuthWrapper>
            <View style={styles.mapContainer}>
              <Map
                onRouteChange={handleRouteChange}
                isOverlayActive={currentRoute !== "/"}
              />
            </View>

            {currentRoute !== "/" && (
              <Animated.View style={[styles.overlay, animatedStyle]}>
                <TouchableOpacity
                  style={StyleSheet.absoluteFill}
                  onPress={() => {
                    router.push("/");
                    handleRouteChange("/");
                  }}
                />
                <Slot
                  screenOptions={{
                    onRouteChange: handleRouteChange, // Pass to Slot children
                  }}
                />
              </Animated.View>
            )}
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
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});
