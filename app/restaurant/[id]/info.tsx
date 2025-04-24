import { View, Text, Image, StyleSheet } from "react-native";
import { useRestaurant } from "../../../contexts/RestaurantContext";

type Restaurant = {
  name: string;
  description: string;
  address: string;
  imageUrls: string[];
};

export default function Info() {
  const restaurantContext = useRestaurant();
  const restaurant = restaurantContext ? restaurantContext.restaurant : null;
  const { name, description, address, imageUrls } = restaurant || {};

  if (!restaurant) return <Text>Loading Info...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{name}</Text>
      <Text>{description}</Text>
      <Text>{address}</Text>
      {imageUrls &&
        imageUrls.map((url) => (
          <Image key={url} source={{ uri: url }} style={styles.image} />
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, height: 800 },
  title: { fontSize: 24, fontWeight: "bold" },
  image: { width: 180, height: 180, marginVertical: 10 },
});
