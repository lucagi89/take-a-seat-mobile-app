import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../../styles/main-page-style";
import { handleLogout } from "../../services/auth";
import { useRouter } from "expo-router";

// Extract SidebarFooter
export default function SidebarFooter() {
  const router = useRouter();
  return (
    <View style={styles.sidebarFooter}>
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => {
          handleLogout()
            .then(() => router.push("/login"))
            .catch((error) => console.error("Logout error:", error));
        }}
      >
        <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
