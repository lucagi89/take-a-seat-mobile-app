import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getRestaurantById } from "../../services/databaseActions";
import { useEffect, useState } from "react";

export default function myRestaurantPage() {
  //state to store the restaurant data
  const [restaurant, setRestaurant] = useState(null);
  //get the restaurant id from the url
  const { id } = useLocalSearchParams();
  //fetch the restaurant data from the database
  useEffect(() => {
    getRestaurantById(id).then((restaurant) => {
      setRestaurant(restaurant);
    });
  }, [id]);

  //display the restaurant data
  if (!restaurant) {
    return <Text>Loading...</Text>;
  }

  return (
    <View>
      <Text>My Restaurant</Text>
      <Text>{restaurant?.name}</Text>
      <Text>{restaurant?.description}</Text>
      <Text>{restaurant?.address}</Text>
    </View>
  );
}
