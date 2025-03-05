import { Stack, Link, usePathname } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { RestaurantProvider, useRestaurant } from "./RestaurantContext";

export default function RestaurantLayout() {
  return (
    <RestaurantProvider>
      <LayoutContent />
    </RestaurantProvider>
  );
}

const LayoutContent = () => {
  const { loading, restaurantId } = useRestaurant();
  const pathname = usePathname(); // Get the current route

  if (loading) return <Text>Loading...</Text>;

  return (
    <View style={{ flex: 1 }}>
      {/* 🟢 Stack Navigator for Subpages */}
      <Stack screenOptions={{ headerShown: false }} />

      {/* 🟡 Navbar */}
      <View style={styles.navbar}>
        {["info", "floorplan", "dishes", "reviews"].map((tab) => {
          const isActive = pathname.includes(
            `/restaurant/${restaurantId}/${tab}`
          );
          return (
            <Link
              key={tab}
              href={`/restaurant/${restaurantId}/${tab}` as any}
              style={styles.navItem}
            >
              <Text style={[styles.navText, isActive && styles.activeNavText]}>
                {tab.toUpperCase()}
              </Text>
            </Link>
          );
        })}
        <Link href={`/`} style={styles.navItem}>
          <Text
            style={[styles.navText, pathname === "/" && styles.activeNavText]}
          >
            {"map".toUpperCase()}
          </Text>
        </Link>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "#007bff",
  },
  navItem: {
    paddingHorizontal: 10,
  },
  navText: {
    color: "white",
    fontWeight: "bold",
  },
  activeNavText: {
    textDecorationLine: "underline",
    color: "#ffdd57",
    backgroundColor: "#333",
    padding: 10,
  },
});
