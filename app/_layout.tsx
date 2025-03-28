import React, { useState, useEffect, useRef } from "react";
import { Slot, useRouter } from "expo-router";
import { UserContextProvider } from "../contexts/userContext";
import {
  SafeAreaView,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";
import { StripeProvider } from "@stripe/stripe-react-native";
import Map from "./map";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Error: {this.state.error?.message || "Unknown error"}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function RootLayout() {
  const router = useRouter();
  const [currentRoute, setCurrentRoute] = useState("/");
  const translateY = useSharedValue(1000);
  const debounceTimeoutRef = useRef(null);

  const handleRouteChange = (route) => {
    console.log("RootLayout - Navigating to:", route);
    setCurrentRoute(route);
    router.replace(route);
  };

  const debounceRouteChange = () => {
    clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => handleRouteChange("/"), 200);
  };

  useEffect(() => {
    console.log("RootLayout - currentRoute changed:", currentRoute);
    if (currentRoute !== "/") {
      translateY.value = withTiming(0, { duration: 300 });
    } else {
      translateY.value = withTiming(1000, { duration: 300 });
    }
  }, [currentRoute]);

  const animatedStyle = useAnimatedStyle(() => {
    console.log(
      "Animated style - translateY:",
      translateY.value,
      "opacity:",
      currentRoute !== "/" ? 1 : 0
    );
    return {
      transform: [{ translateY: translateY.value }],
      opacity: currentRoute !== "/" ? 1 : 0,
    };
  });

  return (
    <ErrorBoundary>
      <UserContextProvider>
        <StripeProvider publishableKey="pk_test_YourStripePublicKey">
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.mapContainer}>
              <Map
                onRouteChange={handleRouteChange}
                isOverlayActive={currentRoute !== "/"}
                onError={(error) => console.error("Map error:", error)}
              />
            </View>

            <Animated.View style={[styles.overlay, animatedStyle]}>
              <TouchableOpacity
                style={StyleSheet.absoluteFill}
                onPress={debounceRouteChange}
              />
              <Slot />
            </Animated.View>
          </SafeAreaView>
        </StripeProvider>
      </UserContextProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
