// app/_layout.tsx
import React from "react";
import { Slot } from "expo-router";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { UserContextProvider } from "../contexts/userContext";
import { StripeProvider } from "@stripe/stripe-react-native";

// class ErrorBoundary extends React.Component {
//   state = { hasError: false, error: null };
//   static getDerivedStateFromError(error) {
//     return { hasError: true, error };
//   }
//   render() {
//     console.log("ErrorBoundary - Rendering");
//     if (this.state.hasError) {
//       return (
//         <View
//           style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
//         >
//           <Text>Error: {this.state.error?.message || "Unknown error"}</Text>
//         </View>
//       );
//     }
//     return this.props.children;
//   }
// }

export default function RootLayout() {
  return (
    <UserContextProvider>
      <StripeProvider publishableKey="pk_test_YourStripePublicKey">
        <SafeAreaView style={styles.safeArea}>
          <Slot />
        </SafeAreaView>
      </StripeProvider>
    </UserContextProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
