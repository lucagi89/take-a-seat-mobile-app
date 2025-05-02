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
  const [favouriteRestaurants, setFavouriteRestaurants] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const handleToggleFavouriteRestaurant = (id: string) => {
    if (user) {
      setFavouriteRestaurants((prev) =>
        prev.filter((restaurant) => restaurant.id !== id)
      );
      toggleRestaurantToFavourites(user.uid, id);
    }
  };

  React.useEffect(() => {
    if (favourites && favourites.length > 0) {
      const fetchRestaurants = async () => {
        try {
          const restaurants = await Promise.all(
            favourites.map((id) => getRestaurantById(id))
          );
          setFavouriteRestaurants(restaurants);
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
      <Text>Favourites</Text>
      <Text>This is the Favourites page.</Text>
      {favouriteRestaurants.length > 0 ? (
        favouriteRestaurants.map((restaurant) => (
          <View key={restaurant?.id}>
            <RestaurantCard restaurant={restaurant} />
            <TouchableOpacity
              onPress={() => handleToggleFavouriteRestaurant(restaurant?.id)}
            >
              <Text>X</Text>
            </TouchableOpacity>
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
