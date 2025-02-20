import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  getRestaurantById,
  findRestaurantTables,
} from "../../../services/databaseActions";
import { useEffect, useState } from "react";
import { Link } from "expo-router";

export default function myRestaurantPage() {
  const { id, ownerId } = useLocalSearchParams();
  const restaurantId = Array.isArray(id) ? id[0] : id;
  //state to store the restaurant datas
  const [restaurant, setRestaurant] = useState<DocumentData | undefined>(
    undefined
  );
  const [tables, setTables] = useState<DocumentData[]>([]);
  //fetch the restaurant data from the database
  useEffect(() => {
    getRestaurantById(restaurantId).then((restaurant) => {
      setRestaurant(restaurant);
    });
    findRestaurantTables(restaurantId).then((tables) => {
      setTables(tables);
    });
  }, [restaurantId]);

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
      <Link href="/my-restaurants">Back to My Restaurants</Link>
      <Link
        href={{
          pathname: "/my-restaurants/[id]/create-restaurant-tables",
          params: { id: restaurantId, ownerId },
        }}
      >
        Create Tables
      </Link>
    </View>
  );
}
