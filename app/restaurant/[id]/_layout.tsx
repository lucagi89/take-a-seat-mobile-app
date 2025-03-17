import { Stack, Link, usePathname } from "expo-router";
import { View, Text, StyleSheet, ImageBackground } from "react-native";
import {
  RestaurantProvider,
  useRestaurant,
} from "../../../contexts/RestaurantContext";

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("../../../assets/images/background.png")} // Adjust path as needed
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* Stack Navigator for Subpages */}
        <Stack screenOptions={{ headerShown: false }} />

        {/* Navbar */}
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
            href="/"
            style={[styles.navItem, pathname === "/" && styles.activeNavItem]}
          >
            <Text
              style={[styles.navText, pathname === "/" && styles.activeNavText]}
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
    backgroundColor: "rgba(240, 236, 227, 0.7)", // Light overlay for wood texture
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
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "#2E7D32", // Deep green, matching titles and accents
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    borderTopWidth: 1,
    borderTopColor: "#C8E6C9", // Soft green border for subtle contrast
  },
  navItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  navText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  activeNavItem: {
    backgroundColor: "#FFCA28", // Gold for active state
  },
  activeNavText: {
    color: "#2E7D32", // Deep green text on gold background
    fontWeight: "700",
  },
});
