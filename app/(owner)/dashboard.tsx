// app/(owner)/dashboard.tsx
import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "../../contexts/userContext";

export default function OwnerDashboard() {
  const router = useRouter();
  const { user, userData } = useUser();

  // Redirect if not on web (optional)
  if (Platform.OS !== "web") {
    return (
      <View style={styles.container}>
        <Text style={styles.warning}>
          This dashboard is only available on the web.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👩‍🍳 Owner Dashboard</Text>

      {user ? (
        <>
          <Text style={styles.info}>Logged in as: {user.email}</Text>
          <Text style={styles.info}>
            Name: {user.displayName || "Anonymous"}
          </Text>
          {/* <Text style={styles.info}>
            Owned Restaurants: {userData?.ownedRestaurants?.length || 0}
          </Text> */}

          {/* Add more actions below */}
          <Text style={styles.section}>▶ Manage Menus</Text>
          <Text style={styles.section}>▶ View Bookings</Text>
          <Text style={styles.section}>▶ Floor Plans</Text>
        </>
      ) : (
        <Text>Not logged in.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 40,
    height: "100%",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 30,
    color: "#2E7D32",
  },
  info: {
    fontSize: 16,
    marginBottom: 10,
  },
  section: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: "500",
    color: "#3366cc",
  },
  warning: {
    marginTop: 100,
    fontSize: 18,
    color: "#d32f2f",
    textAlign: "center",
  },
});
