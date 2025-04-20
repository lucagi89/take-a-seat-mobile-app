import { View, Text, TouchableOpacity, Image } from "react-native";
import { Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "../styles/main-page-style";
import { handleLogout } from "../services/auth";

export const Sidebar = ({
  sidebarVisible,
  toggleSidebar,
  user,
  userData,
  slideAnim,
  imageScaleAnim,
  router,
}: {
  sidebarVisible: boolean;
  toggleSidebar: () => void;
  user: any;
  userData: any;
  slideAnim: Animated.Value;
  imageScaleAnim: Animated.Value;
  router: any;
}) => {
  return (
    <>
      {sidebarVisible && (
        <TouchableOpacity
          style={styles.overlay}
          onPress={toggleSidebar}
          activeOpacity={1}
        />
      )}
      <Animated.View
        style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}
      >
        <LinearGradient
          colors={["#2E7D32", "#4CAF50"]}
          style={styles.sidebarGradient}
        >
          <View style={styles.sidebarHeader}>
            <Animated.View style={{ transform: [{ scale: imageScaleAnim }] }}>
              {userData?.photoURL ? (
                <Image
                  source={{ uri: userData.photoURL }}
                  style={styles.profileImage}
                />
              ) : (
                <Ionicons name="person-circle" size={70} color="#FFCA28" />
              )}
            </Animated.View>
            <Text style={styles.sidebarText}>
              Welcome, {userData?.name || user?.displayName || "Guest"}
            </Text>
          </View>
        </LinearGradient>
        <SidebarLinks userData={userData} router={router} />
        <SidebarFooter router={router} />
      </Animated.View>
    </>
  );
};

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
      text="Profile"
      onPress={() => router.push("/profile")}
    />
    <View style={styles.divider} />
    <SidebarButton
      icon="settings-outline"
      text="Settings"
      onPress={() => router.push("/settings")}
    />
    <View style={styles.divider} />
    <SidebarButton
      icon="create-outline"
      text={userData?.isProfileComplete ? "Edit Profile" : "Complete Profile"}
      onPress={() => router.push("/complete-profile")}
    />
    {userData?.isOwner && (
      <>
        <View style={styles.divider} />
        <SidebarButton
          icon="restaurant-outline"
          text="My Restaurants"
          onPress={() => router.push("/my-restaurants")}
        />
      </>
    )}
    <View style={styles.divider} />
    <SidebarButton
      icon="add-circle-outline"
      text="Create a Restaurant"
      onPress={() => router.push("/create-restaurant")}
    />
    <SidebarButton
      icon="add-circle-outline"
      text="Go to messages"
      onPress={() => router.push("/messages")}
    />
  </View>
);

// Extract SidebarButton for reusability
export const SidebarButton = ({
  icon,
  text,
  onPress,
}: {
  icon: string;
  text: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.sidebarButton} onPress={onPress}>
    <Ionicons name={icon} size={20} color="#2E7D32" />
    <Text style={styles.sidebarLinkText}>{text}</Text>
  </TouchableOpacity>
);

// Extract SidebarFooter
const SidebarFooter = ({ router }: { router: any }) => (
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

export const SearchButton = ({
  showSearchButton,
  onPress,
}: {
  showSearchButton: boolean;
  onPress: () => void;
}) => {
  if (!showSearchButton) return null;
  return (
    <TouchableOpacity style={styles.searchButton} onPress={onPress}>
      <Text style={styles.searchButtonText}>Search Here</Text>
    </TouchableOpacity>
  );
};
