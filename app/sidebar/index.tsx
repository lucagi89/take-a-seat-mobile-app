import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../../styles/main-page-style";
import { SidebarLinks } from "./SidebarLinks";
import { SidebarFooter } from "./SidebarFooter";

export const Sidebar = ({
  user,
  userData,
  router,
}: {
  user: any;
  userData: any;
  router: any;
}) => {
  return (
    <>
      <TouchableOpacity
        style={[
          styles.overlay,
          // {
          //   display: sidebarVisible ? "flex" : "none", // toggle visibility
          // },
        ]}
        onPress={() => {
          router.push("/");
        }}
        activeOpacity={1}
      />

      <View style={[styles.sidebar]}>
        <View style={styles.sidebarGradient}>
          <View style={styles.sidebarHeader}>
            <View>
              {userData?.photoURL ? (
                <Image
                  source={{ uri: userData.photoURL }}
                  style={styles.profileImage}
                />
              ) : (
                <Ionicons name="person-circle" size={70} color="#FFCA28" />
              )}
            </View>
            <Text style={styles.sidebarText}>
              HI, {userData?.name || user?.displayName || "Guest"}
            </Text>
          </View>
        </View>

        <SidebarLinks userData={userData} router={router} />
        <SidebarFooter router={router} />
      </View>
    </>
  );
};
