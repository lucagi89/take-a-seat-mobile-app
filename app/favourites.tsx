import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { useUser } from "../contexts/userContext";
import {
  getRestaurantById,
  toggleRestaurantToFavourites,
} from "../services/databaseActions";
import RestaurantCard from "@/components/RestaurantCard";

export default function Favourites() {
  const { userData, user } = useUser();
  const { favourites = [] } = userData || {};
  const router = useRouter();
  const [favouriteRestaurantsIDs, setFavouriteRestaurantsIDs] = React.useState(
    []
  );
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const handleToggleFavouriteRestaurant = async (id: string) => {
    if (user) {
      setFavouriteRestaurantsIDs((prev) =>
        prev.filter((restaurantId) => restaurantId !== id)
      );
      await toggleRestaurantToFavourites(user.uid, id);
    }
  };

  React.useEffect(() => {
    if (favourites && favourites.length > 0) {
      const fetchRestaurants = async () => {
        try {
          const restaurants = await Promise.all(
            favourites.map((id) => getRestaurantById(id))
          );
          setFavouriteRestaurantsIDs(restaurants);
        } catch (err) {
          setError(err);
        } finally {
          setLoading(false);
        }
      };
      fetchRestaurants();
    } else {
      setLoading(false);
    }
  }, [favourites]);

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>Loading favourites...</Text>
      ) : error ? (
        <Text>Error loading favourites: {error.message}</Text>
      ) : favouriteRestaurantsIDs.length > 0 ? (
        favouriteRestaurantsIDs.map((restaurantID) => (
          <View key={restaurantID}>
            <RestaurantCard
              restaurantID={restaurantID}
              handleToggleFavouriteRestaurant={handleToggleFavouriteRestaurant}
            />
          </View>
        ))
      ) : (
        <Text>No favourite restaurants found.</Text>
      )}
      <TouchableOpacity style={styles.abort} onPress={() => router.back()}>
        <Text>X</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    width: "100%",
    height: "90%",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  abort: {
    backgroundColor: "#FFCA28",
    position: "absolute",
    bottom: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 50,
    marginTop: 20,
  },
});
