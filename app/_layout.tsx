// app/_layout.tsx
import React from "react";
import { Slot, useSegments } from "expo-router";
import { View, StyleSheet, SafeAreaView } from "react-native";
import Map from "../components/map";
import { UserContextProvider } from "../contexts/userContext";
import AuthGate from "@/contexts/AuthGate";

export default function RootLayout() {
  const segments = useSegments();

  const isRoot = segments.length === 0 || segments[0] === "";

  return (
    <UserContextProvider>
      <AuthGate>
        <View style={styles.container}>
          {/* 1. Always show the map */}
          <Map />

          {/* 2. Overlay wrapper: always mounted (so Slot is always available), but only
              intercepts/tints when we're off the root route */}
          <View
            style={styles.overlayWrapper}
            pointerEvents={isRoot ? "none" : "auto"}
          >
            {/* full-screen dimmer, only visible when not root */}
            {!isRoot && <View style={styles.dim} />}

            {/* routed screen – always rendered so router is happy,
              but on root it'll be empty (your index.tsx returns false) */}
            <View style={styles.modal}>
              <SafeAreaView style={{ flex: 1 }}>
                <Slot />
              </SafeAreaView>
            </View>
          </View>
        </View>
      </AuthGate>
    </UserContextProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlayWrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modal: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    justifyContent: "center",
    alignItems: "stretch",
    padding: 20,
  },
});
