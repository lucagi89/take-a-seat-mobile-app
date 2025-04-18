import { Stack, Link, usePathname } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
} from "react-native";
import {
  RestaurantProvider,
  useRestaurant,
} from "../../../contexts/RestaurantContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window"); // Get screen width

export default function RestaurantLayout() {
  return (
    <RestaurantProvider>
      <LayoutContent />
    </RestaurantProvider>
  );
}

const LayoutContent = () => {
  const { loading, restaurantId } = useRestaurant();
  const pathname = usePathname();

  console.log("Current Pathname:", pathname); // Keep for debugging

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("../../../assets/images/background.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <View style={styles.stackContainer}>
          <Stack screenOptions={{ headerShown: false }} />
        </View>

        <View style={styles.navbar}>
          {["info", "floorplan", "dishes", "reviews"].map((tab) => {
            const isActive = pathname.includes(
              `/restaurant/${restaurantId}/${tab}`
            );
            return (
              <Link
                key={tab}
                href={`/restaurant/${restaurantId}/${tab}`}
                style={[styles.navItem, isActive && styles.activeNavItem]}
              >
                <Text
                  style={[styles.navText, isActive && styles.activeNavText]}
                >
                  {tab.toUpperCase()}
                </Text>
              </Link>
            );
          })}
          <Link
            key="map"
            href="/"
            style={[
              styles.navItem,
              (pathname === "/" || pathname === "") && styles.activeNavItem,
            ]}
          >
            <Text
              style={[
                styles.navText,
                (pathname === "/" || pathname === "") && styles.activeNavText,
              ]}
            >
              MAP
            </Text>
          </Link>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    backgroundColor: "rgba(240, 236, 227, 0.7)",
  },
  stackContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    fontSize: 18,
    color: "#2E7D32",
    fontWeight: "600",
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between", // Changed to space-between for even distribution
    paddingVertical: 8, // Reduced from 12 to make it less tall
    paddingHorizontal: 5, // Added small horizontal padding to navbar
    backgroundColor: "#2E7D32",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    borderTopWidth: 1,
    borderTopColor: "#C8E6C9",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: SCREEN_WIDTH, // Explicitly set to screen width
    zIndex: 10,
  },
  navItem: {
    // flex: "20%", // Allow items to share space equally
    paddingHorizontal: 8, // Reduced from 15 to fit better
    paddingVertical: 6, // Reduced from 8
    borderRadius: 8,
    alignItems: "center", // Center text horizontally
  },
  navText: {
    color: "#FFFFFF",
    fontSize: 12, // Reduced from 14 to prevent overflow
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5, // Reduced from 1 for tighter spacing
    textAlign: "center",
    ellipsizeMode: "tail", // Truncate long text with "..."
    numberOfLines: 1, // Prevent text wrapping
  },
  activeNavItem: {
    backgroundColor: "#FFCA28",
  },
  activeNavText: {
    color: "#2E7D32",
    fontWeight: "700",
  },
});
