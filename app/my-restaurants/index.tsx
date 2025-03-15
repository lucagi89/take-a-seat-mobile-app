import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useUser } from "../../contexts/userContext";
import {
  getUserRestaurants,
  deleteDocument,
} from "../../services/databaseActions";
import RestaurantCard from "../../components/RestaurantCard";
import { Redirect, useRouter } from "expo-router";
import { Restaurant } from "../../data/types";
import { Ionicons } from "@expo/vector-icons"; // For icons in buttons

export default function MyRestaurants() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [userRestaurants, setUserRestaurants] = useState<Restaurant[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      getUserRestaurants(user.uid)
        .then((result) => {
          setUserRestaurants(result as Restaurant[]);
        })
        .catch((error) => {
          setError("Error fetching user's restaurants");
        });
    }
  }, [user]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FFCA28" style={styles.loader} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument("restaurants", id);
      setUserRestaurants(
        userRestaurants.filter((restaurant) => restaurant.id !== id)
      );
    } catch (error) {
      setError("Error deleting restaurant");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Restaurants</Text>
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={20}
            color="#D32F2F"
            style={styles.errorIcon}
          />
          <Text style={styles.error}>{error}</Text>
        </View>
      )}
      {userRestaurants.length === 0 && !error && (
        <View style={styles.emptyContainer}>
          <Ionicons name="restaurant-outline" size={40} color="#666" />
          <Text style={styles.empty}>No restaurants found</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push("/create-restaurant")}
            activeOpacity={0.7}
          >
            <Text style={styles.createButtonText}>Create a Restaurant</Text>
          </TouchableOpacity>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {userRestaurants.map((restaurant) => (
          <View key={restaurant.id} style={styles.cardContainer}>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: `/my-restaurants/${restaurant.id}`,
                  params: { ownerId: restaurant.userId },
                })
              }
              activeOpacity={0.8}
            >
              <RestaurantCard restaurant={restaurant} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(restaurant.id)}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/")}
        activeOpacity={0.7}
      >
        <Ionicons
          name="arrow-back-outline"
          size={20}
          color="#FFFFFF"
          style={styles.backIcon}
        />
        <Text style={styles.backButtonText}>Go to Main Page</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5", // Light gray background for consistency
    padding: 20,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E7D32", // Deep green for restaurant theme
    textAlign: "center",
    marginBottom: 20,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(211, 47, 47, 0.1)", // Light red background for error
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorIcon: {
    marginRight: 10,
  },
  error: {
    color: "#D32F2F", // Red for error text
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  empty: {
    fontSize: 18,
    color: "#666",
    marginVertical: 15,
    textAlign: "center",
  },
  createButton: {
    backgroundColor: "#FFCA28", // Gold for a warm accent
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  cardContainer: {
    position: "relative",
    marginBottom: 15,
    backgroundColor: "#FFFFFF", // White card background
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  deleteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#D32F2F", // Red for delete action
    padding: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E7D32", // Deep green for back button
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  backIcon: {
    marginRight: 8,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textTransform: "uppercase",
  },
});
