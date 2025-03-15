import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useUser } from "../../../contexts/userContext";
import { useFocusEffect } from "@react-navigation/native";
import {
  getRestaurantById,
  findRestaurantTables,
} from "../../../services/databaseActions";
import { DocumentData } from "firebase/firestore";
import RestaurantFloorPlan from "../../../components/RestaurantFloorPlan";
import { Table, Restaurant } from "../../../data/types";
import { Ionicons } from "@expo/vector-icons"; // For icons in buttons

export default function MyRestaurantPage() {
  const { user } = useUser();
  const { id, ownerId: ownerIdParam } = useLocalSearchParams();
  const router = useRouter();

  const ownerId = Array.isArray(ownerIdParam) ? ownerIdParam[0] : ownerIdParam;
  const restaurantId = Array.isArray(id) ? id[0] : id;

  const [restaurant, setRestaurant] = useState<DocumentData | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch restaurant data when screen gains focus
  useFocusEffect(
    useCallback(() => {
      if (!restaurantId) return;

      const fetchRestaurant = async () => {
        setLoading(true);
        setError("");
        try {
          const restaurantData = await getRestaurantById(restaurantId);
          if (!restaurantData) {
            setError("Restaurant not found.");
          } else {
            setRestaurant(restaurantData as Restaurant);
          }
        } catch (error) {
          console.error("Error fetching restaurant:", error);
          setError("Error fetching restaurant details.");
        } finally {
          setLoading(false);
        }
      };

      fetchRestaurant();

      // Cleanup when navigating away
      return () => {
        setRestaurant(null);
        setLoading(true);
        setError("");
      };
    }, [restaurantId])
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FFCA28" style={styles.loader} />
      </View>
    );
  }

  if (error || !restaurant) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={24}
            color="#D32F2F"
            style={styles.errorIcon}
          />
          <Text style={styles.error}>{error || "Restaurant not found."}</Text>
        </View>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/my-restaurants")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back-outline"
            size={20}
            color="#FFFFFF"
            style={styles.backIcon}
          />
          <Text style={styles.backButtonText}>Back to My Restaurants</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{restaurant.name}</Text>
      <View style={styles.cardContainer}>
        <View style={styles.detailRow}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#2E7D32"
            style={styles.detailIcon}
          />
          <Text
            style={styles.description}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {restaurant.description}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons
            name="location-outline"
            size={20}
            color="#2E7D32"
            style={styles.detailIcon}
          />
          <Text style={styles.address} numberOfLines={2} ellipsizeMode="tail">
            {restaurant.address}
          </Text>
        </View>
      </View>

      <View style={styles.floorPlanContainer}>
        <Text style={styles.sectionTitle}>Floor Plan</Text>
        <RestaurantFloorPlan
          restaurantId={restaurantId}
          restaurant={restaurant}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() =>
            router.push({
              pathname: "/my-restaurants/[id]/create-restaurant-tables",
              params: { id: restaurantId, ownerId },
            })
          }
          activeOpacity={0.7}
        >
          <Ionicons
            name="add-circle-outline"
            size={20}
            color="#FFFFFF"
            style={styles.buttonIcon}
          />
          <Text style={styles.createButtonText}>Create Tables</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/my-restaurants")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back-outline"
            size={20}
            color="#FFFFFF"
            style={styles.backIcon}
          />
          <Text style={styles.backButtonText}>Back to My Restaurants</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15, // Reduced padding to save space
    backgroundColor: "#F5F5F5", // Light gray background
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24, // Reduced font size to save space
    fontWeight: "bold",
    color: "#2E7D32", // Deep green for restaurant theme
    textAlign: "center",
    marginBottom: 10, // Reduced margin
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cardContainer: {
    backgroundColor: "#FFFFFF", // White card for details
    borderRadius: 15,
    padding: 12, // Reduced padding
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 10, // Reduced margin
    flex: 0,
    minHeight: 80, // Reduced height
    maxHeight: 100, // Limit height to fit screen
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6, // Reduced margin
  },
  detailIcon: {
    marginRight: 8,
  },
  description: {
    fontSize: 14, // Reduced font size
    color: "#333",
    flex: 1,
  },
  address: {
    fontSize: 14, // Reduced font size
    color: "#333",
    flex: 1,
  },
  floorPlanContainer: {
    flex: 1, // Take remaining space
    marginBottom: 10, // Reduced margin
    minHeight: 200, // Reduced minimum height
    maxHeight: 250, // Reduced maximum height to leave space for buttons
  },
  sectionTitle: {
    fontSize: 18, // Reduced font size
    fontWeight: "600",
    color: "#2E7D32",
    marginBottom: 8, // Reduced margin
    textTransform: "uppercase",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5, // Reduced margin
    flex: 0,
    height: 50, // Fixed height to ensure buttons fit
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFCA28", // Gold for create action
    paddingVertical: 10, // Reduced padding
    paddingHorizontal: 12, // Reduced padding
    borderRadius: 8, // Reduced border radius
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    flex: 1,
    marginRight: 8,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 12, // Reduced font size
    fontWeight: "600",
    textTransform: "uppercase",
    textAlign: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E7D32", // Deep green for back button
    paddingVertical: 10, // Reduced padding
    paddingHorizontal: 12, // Reduced padding
    borderRadius: 8, // Reduced border radius
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    flex: 1,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 12, // Reduced font size
    fontWeight: "600",
    textTransform: "uppercase",
    textAlign: "center",
  },
  buttonIcon: {
    marginRight: 4, // Reduced margin
  },
  backIcon: {
    marginRight: 4, // Reduced margin
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorIcon: {
    marginBottom: 10,
  },
  error: {
    fontSize: 18,
    color: "#D32F2F", // Red for error text
    textAlign: "center",
    marginBottom: 20,
  },
});
