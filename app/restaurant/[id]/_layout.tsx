import { Stack, Link } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { RestaurantProvider, useRestaurant } from "./RestaurantContext";

export default function RestaurantLayout() {
  return (
    <RestaurantProvider>
      <LayoutContent />
    </RestaurantProvider>
  );
}

const LayoutContent = () => {
  const { restaurant, loading, restaurantId } = useRestaurant();

  if (loading) return <Text>Loading...</Text>;

  return (
    <View style={{ flex: 1 }}>
      {/* 🟢 Stack Navigator for Subpages */}
      <Stack screenOptions={{ headerShown: false }} />
      {/* 🟡 Navbar */}
      <View style={styles.navbar}>
        {["info", "floorplan", "menu", "reviews"].map((tab) => (
          <Link
            key={tab}
            href={`/restaurant/${restaurantId}/${tab}`}
            style={styles.navItem}
          >
            <Text style={styles.navText}>{tab.toUpperCase()}</Text>
          </Link>
        ))}
        <Link href={`/map`} style={styles.navItem}>
          <Text style={styles.navText}>{"map".toUpperCase()}</Text>
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
});
