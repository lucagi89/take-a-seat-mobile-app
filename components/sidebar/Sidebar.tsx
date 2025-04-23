import { View, Text, TouchableOpacity, Image } from "react-native";
import { Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "../../styles/main-page-style";
import { SidebarLinks } from "./SidebarLinks";
import { SidebarFooter } from "./SidebarFooter";

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
