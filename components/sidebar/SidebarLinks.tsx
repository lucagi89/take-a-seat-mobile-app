import React from "react";
import { View } from "react-native";
import { styles } from "../../styles/main-page-style";
import { SidebarButton } from "./SidebarButton";

// Extract SidebarLinks as a separate component
export const SidebarLinks = ({
  userData,
  router,
}: {
  userData: any;
  router: any;
}) => (
  <View style={styles.sidebarLinks}>
    <SidebarButton
      icon="person-outline"
      text=" Profile"
      onPress={() => router.push("/profile")}
    />
    <View style={styles.divider} />
    <SidebarButton
      icon="settings-outline"
      text=" Settings"
      onPress={() => router.push("/settings")}
    />
    <View style={styles.divider} />
    <SidebarButton
      icon="create-outline"
      text={userData?.isProfileComplete ? " Edit Profile" : " Complete Profile"}
      onPress={() => router.push("/complete-profile")}
    />
    {userData?.isOwner && (
      <>
        <View style={styles.divider} />
        <SidebarButton
          icon="restaurant-outline"
          text=" My Restaurants"
          onPress={() => router.push("/my-restaurants")}
        />
      </>
    )}
    <View style={styles.divider} />
    <SidebarButton
      icon="add-circle-outline"
      text=" Create a Restaurant"
      onPress={() => router.push("/create-restaurant")}
    />
    <View style={styles.divider} />
    <SidebarButton
      icon="mail-outline"
      text=" Go to messages"
      onPress={() => router.push("/messages")}
    />
  </View>
);
