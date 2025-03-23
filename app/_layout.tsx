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
import Map from "./map";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

export default function RootLayout() {
  const router = useRouter();
  const [currentRoute, setCurrentRoute] = useState("/"); // Default to "/"
  const [isMounted, setIsMounted] = useState(false);
  const translateY = useSharedValue(1000);

  console.log(
    "RootLayout - currentRoute:",
    currentRoute,
    "isMounted:",
    isMounted
  );

  useEffect(() => {
    console.log("RootLayout - Setting isMounted to true");
    setIsMounted(true);
  }, []);

  const handleRouteChange = (route) => {
    console.log("RootLayout handleRouteChange - New route:", route);
    setCurrentRoute(route);
    if (isMounted) {
      console.log("RootLayout - Navigating to:", route);
      router.replace(route);
    } else {
      console.log(
        "RootLayout - Not mounted yet, deferring navigation to:",
        route
      );
    }
  };

  useEffect(() => {
    console.log("RootLayout - currentRoute changed:", currentRoute);
    if (currentRoute !== "/") {
      translateY.value = withTiming(0, { duration: 300 });
    } else {
      translateY.value = withTiming(1000, { duration: 300 });
    }
  }, [currentRoute]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  console.log(
    "RootLayout - Rendering main content with currentRoute:",
    currentRoute
  );
  return (
    <UserContextProvider>
      <StripeProvider publishableKey="pk_test_YourStripePublicKey">
        <SafeAreaView style={styles.safeArea}>
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
                  handleRouteChange("/");
                }}
              />
              <Slot />
            </Animated.View>
          )}
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
