import { useLocalSearchParams, Link } from "expo-router";
import { View, Text, StyleSheet, Image } from "react-native";
import { useEffect, useState } from "react";
import { getRestaurantById } from "../../services/databaseActions";
// import RestaurantFloorMap from "../../components/RestaurantFloorPlan";

export default function RestaurantDetails() {
  const { id } = useLocalSearchParams(); // Get restaurant ID from the route
  const restaurantId = Array.isArray(id) ? id[0] : id;
  const [restaurant, setRestaurant] = useState<DocumentData | undefined>(
    undefined
  );

  useEffect(() => {
    getRestaurantById(restaurantId).then((restaurant) => {
      setRestaurant(restaurant);
    });
  }, []);

  return !restaurant ? (
    <Text>Loading...</Text>
  ) : (
    <View style={styles.container}>
      <Text style={styles.title}>{restaurant?.name}</Text>
      <Text>{restaurant?.description}</Text>
      <Text>{restaurant?.address}</Text>
      {restaurant?.imageUrls &&
        restaurant.imageUrls.map((url) => (
          <Image
            key={url}
            source={{ uri: url, cache: "force-cache" }}
            style={{ width: 200, height: 200 }}
          />
        ))}
      {/* Render the floor plan */}
      {/* if(restaurant)
      {
        <RestaurantFloorMap
          restaurant={restaurant}
          restaurantId={restaurantId}
        />
      } */}
      {/* You can fetch restaurant details here based on the ID */}
      <Link href="/map">Back to the Map</Link>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
