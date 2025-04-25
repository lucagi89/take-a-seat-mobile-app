// app/restaurant/[id]/_layout.tsx
import React, { useEffect, useState } from "react";
import { Stack, Link, usePathname } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import {
  RestaurantProvider,
  useRestaurant,
} from "../../../contexts/RestaurantContext";
import {
  toggleRestaurantToFavourites,
  seeIfRestaurantIsInFavourites,
} from "../../../services/databaseActions";
import { useUser } from "../../../contexts/userContext";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function RestaurantLayout() {
  return (
    <RestaurantProvider>
      <LayoutContent />
    </RestaurantProvider>
  );
}

const LayoutContent = () => {
  const { user } = useUser();
  const { loading, restaurantId } = useRestaurant();
  const pathname = usePathname();
  const [isRestaurantFavourite, setIsRestaurantFavourite] = useState(false);

  useEffect(() => {
    if (user) {
      seeIfRestaurantIsInFavourites(user.uid, restaurantId)
        .then((isFavourite) => {
          setIsRestaurantFavourite(isFavourite);
        })
        .catch((error) => {
          console.error("Error checking if restaurant is favourite:", error);
        });
    }
  }, [user, restaurantId]);

  const handleToggleFavouriteRestaurant = () => {
    if (user) {
      toggleRestaurantToFavourites(user.uid, restaurantId)
        .then(() => {
          setIsRestaurantFavourite((prev) => !prev);
        })
        .catch((error) => {
          console.error("Error toggling restaurant favourite:", error);
        });
    }
  };

  // Check if the restaurant is a favourite when the user or restaurantId changes

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TouchableOpacity
        style={{
          position: "absolute",
          top: 40,
          right: 20,
          zIndex: 10,
          borderRadius: 50,
          padding: 10,
        }}
        onPress={() => {
          handleToggleFavourite();
        }}
      >
        <Ionicons
          name={isRestaurantFavourite ? "star" : "star-outline"}
          size={30}
          color="#2E7D32"
        />
      </TouchableOpacity>
      <View style={styles.container}>
        {/* 1. Give this full-height space to the Stack */}
        <View style={styles.stackContainer}>
          <Stack screenOptions={{ headerShown: false }} />
        </View>

        {/* 2. Now this navbar will pin to the bottom of that full-screen container */}
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
              X
            </Text>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Make the root container fill the entire overlay area
  container: {
    // flex: 1,
    backgroundColor: "rgba(254, 180, 8, 0.7)",
    position: "absolute",
    top: 30,
    left: 0,
    right: 0,
    bottom: 0,
    height: "100%",
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
  },
  // Give the Stack room to render in the body of the modal
  stackContainer: {
    maxHeight: "100%",
    flex: 1,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
  },
  loadingText: {
    fontSize: 18,
    color: "#2E7D32",
    fontWeight: "600",
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around", // or space-between/space-evenly
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 5,
    backgroundColor: "#2E7D32",
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%", // full width
    height: 50, // give it a fixed height
    zIndex: 10,
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
  },
  navItem: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  navText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  activeNavItem: {
    backgroundColor: "#FFCA28",
  },
  activeNavText: {
    color: "#2E7D32",
    fontWeight: "700",
  },
});
