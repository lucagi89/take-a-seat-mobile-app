import { View, Text } from "react-native";
import { useLocalSearchParams, Link, useRouter } from "expo-router";
import { useUser } from "../../../contexts/userContext";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  getRestaurantById,
  findRestaurantTables,
} from "../../../services/databaseActions";
import { DocumentData } from "firebase/firestore";
import RestaurantFloorPlan from "../../../components/RestaurantFloorPlan";
import { Table, Restaurant } from "../../../data/types";

export default function MyRestaurantPage() {
  const { user } = useUser();
  const { id, ownerId: ownerIdParam } = useLocalSearchParams();
  const router = useRouter();

  const ownerId = Array.isArray(ownerIdParam) ? ownerIdParam[0] : ownerIdParam;
  const restaurantId = Array.isArray(id) ? id[0] : id;

  const [restaurant, setRestaurant] = useState<DocumentData | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch restaurant data when screen gains focus
  useFocusEffect(
    useCallback(() => {
      if (!restaurantId) return;

      const fetchRestaurant = async () => {
        setLoading(true);
        try {
          const restaurantData = await getRestaurantById(restaurantId);
          setRestaurant(restaurantData as Restaurant);
        } catch (error) {
          console.error("Error fetching restaurant:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchRestaurant();

      // Cleanup when navigating away
      return () => {
        setRestaurant(null);
        setLoading(true);
      };
    }, [restaurantId])
  );

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (!restaurant) {
    return <Text>Restaurant not found.</Text>;
  }

  return (
    <View key={restaurantId} style={{ backgroundColor: "white" }}>
      <Text>My Restaurant</Text>
      <Text>{restaurant.name}</Text>
      <Text>{restaurant.description}</Text>
      <Text>{restaurant.address}</Text>

      {/* Back button using router.replace to avoid stale history */}
      <Text
        onPress={() => router.replace("/my-restaurants")}
        style={{ color: "blue", marginVertical: 10 }}
      >
        Back to My Restaurants
      </Text>

      <Text>Floor Plan:</Text>
      <RestaurantFloorPlan
        restaurantId={restaurantId}
        restaurant={restaurant}
      />

      {/* Using replace in Link to avoid stacking */}
      <Link
        replace
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
