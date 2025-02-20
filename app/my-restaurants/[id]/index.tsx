import { View, Text } from "react-native";
import { useLocalSearchParams, Link } from "expo-router";
import { useEffect, useState } from "react";
import {
  getRestaurantById,
  findRestaurantTables,
} from "../../../services/databaseActions";
import { DocumentData } from "firebase/firestore"; // Ensure this import if using Firestore

export default function MyRestaurantPage() {
  const { id, ownerId } = useLocalSearchParams();
  const restaurantId = Array.isArray(id) ? id[0] : id;

  // State to store restaurant data
  const [restaurant, setRestaurant] = useState<DocumentData | null>(null);
  const [tables, setTables] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurantId) return;

    const fetchRestaurant = async () => {
      try {
        const restaurantData = await getRestaurantById(restaurantId);
        setRestaurant(restaurantData);
      } catch (error) {
        console.error("Error fetching restaurant:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [restaurantId]);

  useEffect(() => {
    if (!restaurantId) return;

    const fetchTables = async () => {
      try {
        const tablesData = await findRestaurantTables(restaurantId);
        console.log("Fetched Tables:", tablesData); // ✅ Debugging
        setTables(tablesData);
      } catch (error) {
        console.error("Error fetching tables:", error);
      }
    };

    fetchTables();
  }, [restaurantId]); // ✅ Correct dependency

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (!restaurant) {
    return <Text>Restaurant not found.</Text>;
  }

  return (
    <View>
      <Text>My Restaurant</Text>
      <Text>{restaurant.name}</Text>
      <Text>{restaurant.description}</Text>
      <Text>{restaurant.address}</Text>

      <Link href="/my-restaurants">Back to My Restaurants</Link>

      <View>
        <Text>Tables</Text>
        {tables.length > 0 ? (
          tables.map((table) => (
            <View key={table.id}>
              <Text>Table ID: {table.id}</Text>
              <Text>Capacity: {table.capacity}</Text>
            </View>
          ))
        ) : (
          <Text>No tables available.</Text>
        )}
      </View>

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
