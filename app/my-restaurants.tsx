import React, { useEffect, useState } from "react";
import { ScrollView, Text, View, StyleSheet } from "react-native";
import { useUser } from "../contexts/userContext";
import { getUserRestaurants } from "../services/databaseActions";
import RestaurantCard from "../components/RestaurantCard";
import { Redirect } from "expo-router";
import { Link } from "expo-router";

export default function MyRestaurants() {
  const { user, loading } = useUser();
  const [userRestaurants, setUserRestaurants] = useState<{ id: string }[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      getUserRestaurants(user.uid)
        .then((result) => {
          setUserRestaurants(result);
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Restaurants</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      {userRestaurants.length === 0 && (
        <Text style={styles.empty}>No restaurants found</Text>
      )}
      <ScrollView>
        {userRestaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </ScrollView>
      <Link href="/" style={styles.link}>
        Go back
      </Link>
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
});
