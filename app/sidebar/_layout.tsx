// app/_layout.tsx
import React from "react";
import { Slot } from "expo-router";
import { View } from "react-native";

export default function RootLayout() {
  return (
    <View>
      <Slot />
    </View>
  );
}
