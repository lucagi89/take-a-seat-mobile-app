import React from "react";
import { View } from "react-native";
import { styles } from "../../styles/main-page-style";
import { SidebarButton } from "./SidebarButton";
import { useNavigationContainerRef } from "expo-router";

// Extract SidebarLinks as a separate component
export const SidebarLinks = ({
  userData,
  router,
  toggleSidebar,
}: {
  userData: any;
  router: any;
  toggleSidebar: (onFinish?: () => void) => void;
}) => {
  const navRef = useNavigationContainerRef();
  // console.log("SidebarLinks userData");

  return (
    <View style={styles.sidebarLinks}>
      <SidebarButton
        icon="person-outline"
        text=" Profile"
        onPress={() => {
          toggleSidebar();
          setTimeout(() => {
            router.push("/profile"); // ✅ enables back button
          }, 300); // just enough delay to let sidebar close
        }}
      />
      {/* <View style={styles.divider} />
      <SidebarButton
        icon="create-outline"
        text={
          userData?.isProfileComplete ? " Edit Profile" : " Complete Profile"
        }
        onPress={() => router.push("/complete-profile")}
      /> */}
      {userData?.isOwner && (
        <>
          <View style={styles.divider} />
          <SidebarButton
            icon="restaurant-outline"
            text=" My Restaurants"
            onPress={() =>
              toggleSidebar(() => {
                router.push("/profile");
              })
            }
          />
        </>
      )}
      {/* <View style={styles.divider} />
      <SidebarButton
        icon="add-circle-outline"
        text=" Create a Restaurant"
        onPress={() => router.push("/create-restaurant")}
      /> */}
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
};
