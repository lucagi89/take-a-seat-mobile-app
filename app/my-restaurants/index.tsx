import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Button,
} from "react-native";
import { useUser } from "../../contexts/userContext";
import {
  getUserRestaurants,
  deleteElement,
} from "../../services/databaseActions";
import RestaurantCard from "../../components/RestaurantCard";
import { Redirect, useRouter } from "expo-router";
import { Restaurant } from "../../data/types";

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
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteElement("restaurants", id);
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
      {error && <Text style={styles.error}>{error}</Text>}
      {userRestaurants.length === 0 && (
        <Text style={styles.empty}>No restaurants found</Text>
      )}
      <ScrollView>
        {userRestaurants.map((restaurant) => (
          <View key={restaurant.id}>
            <TouchableOpacity
              key={restaurant.id}
              onPress={() =>
                router.push({
                  pathname: `/my-restaurants/${restaurant.id}`,
                  params: { ownerId: restaurant.userId }, // Passing only ownerId
                })
              }
            >
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            </TouchableOpacity>
            <Button
              title="Xoooooo"
              style={styles.deleteButton}
              onPress={() => handleDelete(restaurant.id)}
            />
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/")}
      >
        <Text style={styles.link}>Go to Mainpage</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },
  error: {
    color: "red",
    marginBottom: 20,
  },
  empty: {
    marginBottom: 20,
  },
  link: {
    marginTop: 20,
  },
  backButton: {
    marginTop: 20,
    alignSelf: "center",
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: "red",
    color: "white",
    borderRadius: 5,
    width: 30,
    height: 30,
  },
});
