import React from "react";
import { View } from "react-native";
import { styles } from "../../styles/main-page-style";
import SidebarButton from "./SidebarButton";
import { useNavigationContainerRef, useRouter } from "expo-router";

// Extract SidebarLinks as a separate component
export default function SidebarLinks(userData) {
  const navRef = useNavigationContainerRef();
  const router = useRouter();
  return (
    <View style={styles.sidebarLinks}>
      <SidebarButton
        icon="person-outline"
        text=" Profile"
        onPress={() => {
          router.push("/profile");
        }}
      />
      {userData?.isOwner && (
        <>
          <View style={styles.divider} />
          <SidebarButton
            icon="restaurant-outline"
            text=" My Restaurants"
            onPress={() => {
              router.push("/my-restaurants");
            }}
          />
        </>
      )}
      <View style={styles.divider} />
      <SidebarButton
        icon="mail-outline"
        text=" Notifications"
        onPress={() => router.push("/notifications")}
      />
      <View style={styles.divider} />
      <SidebarButton
        icon="heart-outline"
        text=" Favourites"
        onPress={() => router.push("/favourites")}
      />
      <View style={styles.divider} />
      <SidebarButton
        icon="restaurant-outline"
        text=" Hungry button"
        onPress={() => router.push("/settings")}
      />
      <View style={styles.divider} />
      <SidebarButton
        icon="settings-outline"
        text=" Settings"
        onPress={() => router.push("/settings")}
      />
      <View style={styles.divider} />
      <SidebarButton
        icon="information-circle-outline"
        text=" Info"
        onPress={() => router.push("/settings")}
      />
      <View style={styles.divider} />
    </View>
  );
}
