import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../../styles/main-page-style";

// Extract SidebarButton for reusability
export default function SidebarButton({
  icon,
  text,
  onPress,
}: {
  icon: string;
  text: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.sidebarButton} onPress={onPress}>
      <Ionicons name={icon} size={20} color="#2E7D32" />
      <Text style={styles.sidebarLinkText}>{text}</Text>
    </TouchableOpacity>
  );
}
