import React from "react";
import { Stack } from "expo-router";
import { View, Text, StyleSheet, Platform } from "react-native";

export default function OwnerLayout() {
  // Optional: restrict to web
  if (Platform.OS !== "web") {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>This area is only available on the web.</Text>
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    fontSize: 16,
    color: "#d32f2f",
    textAlign: "center",
  },
});
